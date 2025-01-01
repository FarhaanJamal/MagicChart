'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const LineChartComponent = ({plotData}) => {
    const calculateDomain = (data) => {
        if (!data || data.length === 0) return [0, 'auto']
        const minVal = Math.min(...data.map(d => Math.min(d.high, d.low)))
        const maxVal = Math.max(...data.map(d => Math.max(d.high, d.low)))
        const range = maxVal - minVal
        const padding = range * 0.1
        return [Math.floor(minVal - padding), Math.ceil(maxVal + padding)]
    }
    return <div className="w-full h-[200px] sm:h-[300px]">
        <ResponsiveContainer>
            <LineChart margin={{right: 20}} data={plotData}>
                <CartesianGrid strokeDasharray="4 4"/>
                <XAxis dataKey="datetime" tick={{ fontSize: 12 ,fill: '#FFFFFF'}}/>
                <YAxis domain={calculateDomain(plotData)} tick={{ fontSize: 12 ,fill: '#FFFFFF'}}/>
                <Legend wrapperStyle={{ fontSize: '14px'}} />
                <Tooltip content={<CustomTooltip />} />
                <Line dataKey="high" stroke="#FF5733" label={<CustomizedLabel data={plotData} />}/>
                <Line dataKey="low" stroke="#3498DB" label={<CustomizedLabel data={plotData} />}/>
            </LineChart>
        </ResponsiveContainer>
    </div>
}

export default LineChartComponent

const CustomizedLabel = ({ x, y, value, index, data }) => {
    if (index === data.length - 1) {
        return (
            <text x={x} y={y} fontSize={12} fill="#FFFFFF" textAnchor="middle" dy={-10} dx={-10}>
                {value} {}
            </text>
        )
    }
    return null
}

const CustomTooltip = ({active, payload, label}) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-[10px] bg-secondaryColor flex flex-col gap-[2px] rounded-[18px]">
                <p className="font-medium text-md">{label}</p>
                <p className="text-sm">High: <span className="ml-2">{payload[0].value}</span></p>
                <p className="text-sm">Low: <span className="ml-2">{payload[1].value}</span></p>
            </div>
        )
    }
    return null
}