from tvDatafeed import TvDatafeed, Interval
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from joblib import load
#import matplotlib.pyplot as plt
from time import sleep

def get_candles(interval, prev_val = 0):
    tv = TvDatafeed()
    retries = 0
    max_retries = 5

    while retries < max_retries:
        try:
            if interval == "1_minute":
                niftyIndex = tv.get_hist(symbol='NIFTY', exchange='NSE', interval=Interval.in_1_minute, n_bars=(211 + prev_val))
            elif interval == "3_minute":
                niftyIndex = tv.get_hist(symbol='NIFTY', exchange='NSE', interval=Interval.in_3_minute, n_bars=(211 + prev_val))
            elif interval == "5_minute":
                niftyIndex = tv.get_hist(symbol='NIFTY', exchange='NSE', interval=Interval.in_5_minute, n_bars=(211 + prev_val))
            elif interval == "15_minute":
                niftyIndex = tv.get_hist(symbol='NIFTY', exchange='NSE', interval=Interval.in_15_minute, n_bars=(211 + prev_val))
            elif interval == "1_hour":
                niftyIndex = tv.get_hist(symbol='NIFTY', exchange='NSE', interval=Interval.in_1_hour, n_bars=(211 + prev_val))
            else:
                raise ValueError("Invalid Interval")

            data = pd.DataFrame(niftyIndex)
            data.reset_index(inplace=True)
            data.drop(columns=["symbol", "volume"], inplace=True)

            currentDate = pd.Timestamp.now()
            if data.iloc[-1]['datetime'] < currentDate:
                data = data.iloc[:-1]
                
            if prev_val != 0:
                data = data.iloc[:-prev_val].reset_index(drop=True)

            return data

        except KeyError:
            retries += 1
            print(f"KeyError encountered. Retrying... ({retries}/{max_retries})")
            sleep(2)

    raise KeyError("Maximum retries reached. Unable to fetch data.")



def prepare_candles(interval, prev_val = 0):
    data = get_candles(interval, prev_val)
    
    #--------------------------------------------------------------

    data["datetime"] = pd.to_datetime(data["datetime"])

    data['day'] = data['datetime'].dt.dayofweek
    data['hour'] = data['datetime'].dt.hour
    if interval != "1_hour":
        data['minute'] = data['datetime'].dt.minute

    data["mv20"] = data["close"].rolling(window=20).mean()
    data["mv50"] = data["close"].rolling(window=50).mean()
    data["mv200"] = data["close"].rolling(window=200).mean()

    data['tr'] = np.maximum(data['high'] - data['low'], np.abs(data['high'] - data['close'].shift()), np.abs(data['low'] - data['close'].shift()))
    data['atr'] = data['tr'].rolling(window=14).mean()
    data.drop(columns=['tr'], inplace=True)

    data = data.iloc[-11:].reset_index(drop=True)

    #--------------------------------------------------------------

    columns_to_difference = ["open", "high", "low", "close", "mv20", "mv50", "mv200", "atr"]
    if interval != "1_hour":
        other_columns = ["datetime", "day", "hour", "minute"]
    else:
        other_columns = ["datetime", "day", "hour"]

    data_diff = pd.DataFrame()
    data_diff[other_columns] = data[other_columns]

    for col in columns_to_difference:
        data_diff[col] = data[col].diff()

    data_diff = data_diff.iloc[1:].reset_index(drop=True)

    #--------------------------------------------------------------

    target_candle_data_cols = ['high', 'low']
    if interval == "5_minute":
        other_candle_data_cols = ['day', 'hour', 'minute', 'open', 'close', 'mv20', 'mv50', 'mv200', 'atr']
        candle_data_cols = ['open', 'high', 'low', 'close', 'day', 'hour', 'minute', 'mv20', 'mv50', 'mv200', 'atr']
    elif interval == "1_hour":
        other_candle_data_cols = ['day', 'hour', 'open', 'close', 'mv20', 'mv50', 'mv200', 'atr']
        candle_data_cols = ['day', 'hour', 'open', 'high', 'low', 'close', 'mv20', 'mv50', 'mv200', 'atr']
    else:
        other_candle_data_cols = ['day', 'hour', 'minute', 'open', 'close', 'mv20', 'mv50', 'mv200', 'atr']
        candle_data_cols = ['day', 'hour', "minute", 'open', 'high', 'low', 'close', 'mv20', 'mv50', 'mv200', 'atr']

    scalar_candle = load(f'archive/scalars/scalar_{interval}_candle.save')
    scalar_candle_target = load(f'archive/scalars/scalar_{interval}_candle_target.save')

    data_diff[other_candle_data_cols] = scalar_candle.transform(data_diff[other_candle_data_cols])
    data_diff[target_candle_data_cols] = scalar_candle_target.transform(data_diff[target_candle_data_cols])
    #print(data_diff.head(15))

    #--------------------------------------------------------------

    PAST_WINDOW = 10

    candle_sequences = []
    for ind in range(len(data_diff) - PAST_WINDOW + 1):
        candle_seq = data_diff.iloc[ind : ind + PAST_WINDOW][candle_data_cols].values
        candle_sequences.append(candle_seq)

    candle_sequences = np.array(candle_sequences)

    return candle_sequences, data



def predict_n_prepare(candle_sequences, data, interval):
    #data["datetime"] = pd.to_datetime(data["datetime"]) + pd.Timedelta(hours=5.5)
    data = data.iloc[1:].reset_index(drop=True)
    model = load(f"archive/models/model_{interval}.save")
    scaled_pred = model.predict(candle_sequences)
    
    scalar_candle_target = load(f'archive/scalars/scalar_{interval}_candle_target.save')
    y_pred = scalar_candle_target.inverse_transform(scaled_pred.reshape(-1, scaled_pred.shape[-1])).reshape(scaled_pred.shape)
    #print(y_pred[0][0])

    y_pred_flat = y_pred.reshape(-1, 2)
    last_row = data[["high", "low"]].iloc[-1]
    new_row = last_row + y_pred_flat[0]
    new_row = np.round(new_row, 2) 
    new_row_df = pd.DataFrame([new_row], columns=["high", "low"])
    if interval == "1_minute":
        new_row_df["datetime"] = pd.to_datetime(data["datetime"].iloc[-1]) + pd.Timedelta(minutes=1)
    elif interval == "3_minute":
        new_row_df["datetime"] = pd.to_datetime(data["datetime"].iloc[-1]) + pd.Timedelta(minutes=3)
    elif interval == "5_minute":
        new_row_df["datetime"] = pd.to_datetime(data["datetime"].iloc[-1]) + pd.Timedelta(minutes=5)
    elif interval == "15_minute":
        new_row_df["datetime"] = pd.to_datetime(data["datetime"].iloc[-1]) + pd.Timedelta(minutes=15)
    elif interval == "1_hour":
        new_row_df["datetime"] = pd.to_datetime(data["datetime"].iloc[-1]) + pd.Timedelta(minutes=60)

    plot_data = data[["datetime", "high", "low"]].copy()
    plot_data = pd.concat([plot_data, new_row_df], ignore_index=True)
    plot_data = plot_data.iloc[1:].reset_index(drop=True)
    return plot_data

def get_prediction(interval):
    candle_sequences, data = prepare_candles(interval)
    #print("Input shape",candle_sequences.shape)
    plot_data = predict_n_prepare(candle_sequences, data, interval)
    #print(plot_data)
    plot_data["datetime"] = pd.to_datetime(plot_data["datetime"])
    plot_data["datetime"] = plot_data["datetime"].dt.strftime("%H:%M")
    json_output = plot_data.to_json(orient="records")
    #print(json_output)
    return json_output