import React from "react";
import { useState, useEffect } from "react";
import axios from "axios"
import { BASE_URL } from "../config";
import Header from "../components/Header"
import Footer from "../components/Footer"
import LineChartComponent from "../components/LineChart";
import { toast } from "react-toastify";

const Home = () => {
    const [plotData1min, setPlotData1min] = useState(Array(11).fill(0).map(() => ({datetime:"NaN", high: 0, low: 0})))
    const [plotData3min, setPlotData3min] = useState(Array(11).fill(0).map(() => ({datetime:"NaN", high: 0, low: 0})))
    const [plotData5min, setPlotData5min] = useState(Array(11).fill(0).map(() => ({datetime:"NaN", high: 0, low: 0})))
    const [plotData15min, setPlotData15min] = useState(Array(11).fill(0).map(() => ({datetime:"NaN", high: 0, low: 0})))
    const [plotData1hr, setPlotData1hr] = useState(Array(11).fill(0).map(() => ({datetime:"NaN", high: 0, low: 0})))

    const fetchData = async (interval, setPlotData, retryCount = 0) => {
        try {
            const response = await axios.get(`${BASE_URL}/predict/${interval}`)
            const plotData = JSON.parse(response.data.plotData)
            setPlotData(plotData)
        } catch (err) {
            if (err.response && err.response.status === 500 && retryCount < 3) {
                console.log(`Retrying... Attempt ${retryCount + 1} ${interval}`)
                setTimeout(() => {
                    fetchData(interval, setPlotData, retryCount + 1)
                }, 30000)
            } else {
                toast.error(`Error predicting ${interval}`)
            }
        }
    }

    useEffect(() => {
        const timeoutIds = []
        const intervalIds = []
        const calculateSleepTime = (interval) => {
            const curTime = new Date()
            const currentMinute = curTime.getMinutes()
            const currentSecond = curTime.getSeconds()
            let sleepTime = 0
            if (interval === 1) {
                if (currentSecond === 0) {
                    sleepTime = 60000
                } else {
                    sleepTime = (60 - currentSecond) * 1000 + (2 * 1000 ) 
                }
            } else if (interval === 3) {
                const remainder = currentMinute % 3
                sleepTime = (3 - remainder) * 60 * 1000 + (2 * 1000 ) - currentSecond * 1000
            }  
            else if (interval === 5) {
                const remainder = currentMinute % 5
                sleepTime = (5 - remainder) * 60 * 1000 + (2 * 1000 ) - currentSecond * 1000
            } else if (interval === 15) {
                const remainder = currentMinute % 15
                sleepTime = (15 - remainder) * 60 * 1000 + (2 * 1000 ) - currentSecond * 1000
            }
            else if (interval === 60) {
                sleepTime = (60 - currentMinute + 15) * 60 * 1000 + (2 * 1000 ) - currentSecond * 1000 
            }
            return sleepTime
        }

        const scheduleFetch = (interval, fetchFn, delay) => {
            const timeoutId = setTimeout(() => {
                fetchFn()
                const intervalId = setInterval(fetchFn, interval)
                intervalIds.push(intervalId)
            }, delay)
            timeoutIds.push(timeoutId)
        }

        fetchData("1_minute", setPlotData1min)
        fetchData("3_minute", setPlotData3min)
        fetchData("5_minute", setPlotData5min)
        fetchData("15_minute", setPlotData15min)
        fetchData("1_hour", setPlotData1hr)

        scheduleFetch(60000, () => fetchData("1_minute", setPlotData1min), calculateSleepTime(1))
        scheduleFetch(180000, () => fetchData("3_minute", setPlotData3min), calculateSleepTime(3))
        scheduleFetch(300000, () => fetchData("5_minute", setPlotData5min), calculateSleepTime(5))
        scheduleFetch(900000, () => fetchData("15_minute", setPlotData15min), calculateSleepTime(15))
        scheduleFetch(3600000, () => fetchData("1_hour", setPlotData1hr), calculateSleepTime(60))

        return () => {
            timeoutIds.forEach(clearTimeout)
            intervalIds.forEach(clearInterval)
        }
    }, []);

    return <>
        <div className="min-h-screen flex flex-col">
            <Header className="z-50"/>
            <div className="container ">
                <div className="bg-accentColorWhite rounded-[18px] flex justify-around py-[5px] mt-4">
                    <div className="text-[20px] font-bold my-1">Symbol</div>
                    <div className="text-[14px] my-[5px] rounded-[18px] bg-secondaryColor p-[2px]">
                        <p className={'text-accentColorLightBlue w-[100px] px-[24px] pt-[2px] text-opacity-100'}>NIFTY50</p>
                    </div>
                </div>
            </div>
            <div className="container flex-wrap justify-center flex flex-row">
                <div className="flex gap-4 items-center justify-between mt-4 w-full sm:w-auto">
                    <div className="container max-w-[500px] sm:max-w-[600px] sm:min-w-[600px] min-h-[300px]">
                        <div key={JSON.stringify(plotData1min)} className="flex flex-col gap-2 p-[20px] bg-accentColorWhite rounded-[18px]">
                                <div className="text-[18px] sm:text-[23px] md:text-[28px] font-bold my-1 ml-[20px]">1-minute</div>
                                <LineChartComponent plotData={plotData1min}/>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 items-center justify-between mt-4 w-full sm:w-auto">
                    <div className="container max-w-[500px] sm:max-w-[600px] sm:min-w-[600px] min-h-[300px]">
                        <div className="flex flex-col gap-2 p-[20px] bg-accentColorWhite rounded-[18px]">
                                <div className="text-[18px] sm:text-[23px] md:text-[28px] font-bold my-1 ml-[20px]">3-minute</div>
                                <LineChartComponent plotData={plotData3min}/>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 items-center justify-between mt-4 w-full sm:w-auto">
                    <div className="container max-w-[500px] sm:max-w-[600px] sm:min-w-[600px] min-h-[300px]">
                        <div key={JSON.stringify(plotData5min)} className="flex flex-col gap-2 p-[20px] bg-accentColorWhite rounded-[18px]">
                                <div className="text-[18px] sm:text-[23px] md:text-[28px] font-bold my-1 ml-[20px]">5-minute</div>
                                <LineChartComponent plotData={plotData5min}/>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 items-center justify-between mt-4 w-full sm:w-auto">
                    <div className="container max-w-[500px] sm:max-w-[600px] sm:min-w-[600px] min-h-[300px]">
                        <div className="flex flex-col gap-2 p-[20px] bg-accentColorWhite rounded-[18px]">
                                <div className="text-[18px] sm:text-[23px] md:text-[28px] font-bold my-1 ml-[20px]">15-minute</div>
                                <LineChartComponent plotData={plotData15min}/>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 items-center justify-between mt-4 w-full sm:w-auto">
                    <div className="container max-w-[500px] sm:max-w-[600px] sm:min-w-[600px] min-h-[300px]">
                        <div key={JSON.stringify(plotData1hr)} className="flex flex-col gap-2 p-[20px] bg-accentColorWhite rounded-[18px]">
                                <div className="text-[18px] sm:text-[23px] md:text-[28px] font-bold my-1 ml-[20px]">1-hour</div>
                                <LineChartComponent plotData={plotData1hr}/>
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    </>
};

export default Home;