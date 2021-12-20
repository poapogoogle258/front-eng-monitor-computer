import { TimeSeries,TimeRangeEvent, TimeRange } from "pondjs";
import { useEffect, useState } from "react";

import { Button,Dropdown } from "semantic-ui-react";



import {
  Resizable,
  Charts,
  ChartContainer,
  ChartRow,
  YAxis,
  LineChart,
  Legend,
  styler
} from "react-timeseries-charts";



const group_color = ['9f51c2','7d8ee0','3af952','64359e','c866ee','9b75dd','abf4ed','28a586','da8699']
const options = [{
    key: '15min',
    text: '15min',
    value: 900000,
    },
    {
    key: '1Hrs',
    text: '1Hrs',
    value: 3600000,
    },
    {
    key: '24Hrs',
    text: '24Hrs',
    value: 86400000,
    }
]

function groupBy_host(data){
    let group = {}

    data.forEach(item => {
        const key = item.host

        group[key] = group[key] || [];
        group[key].push(item);
    });

    return group
}


export default function ChartStatus(pros){
    const {data,enablePanZoom,timeStart,timeEnd,setTime} = pros

    const [currentTime,setCurrentTime] = useState()
    const [StartTime,setStartTime] = useState((timeStart === undefined)? new Date(timeEnd.getTime() - 15 * 60000) : timeStart )

    const grabeByHost = groupBy_host(data)
    const groupByHostSorted = Object.keys(grabeByHost).sort()

    const [filter0,setFilter] = useState(false)

    const style = styler(groupByHostSorted.map( (data,index) => {
        return {
            'key' : `com_${index}`,
            'color' :`#${group_color[index]}`,
            'width': 2
        }
    }))

    useEffect(() => {
        setCurrentTime(timeEnd) 
    },[timeEnd])

    return  <>
    <div>
        <ChartContainer 
            showGrid ={true} 
            onTimeRangeChanged={(timerange0) => {
                setStartTime(timerange0.begin())
                setCurrentTime(timerange0.end())
            }}  
            enablePanZoom={enablePanZoom || false} 
            minDuration={1000*30} 
            timeRange={new TimeRange([StartTime,currentTime])} 
            width={1350}
            >
            <ChartRow height="500">
                <YAxis
                    showGrid ={true} 
                    id="price"
                    min={0} 
                    max={100}/>
                    
                <Charts>
                    {(filter0)? groupByHostSorted.map((data,index) => {

                        const points = grabeByHost[data]
                        const points_cpu = points
                        .map(item => [item.time, item.cpu])
                        .sort((a,b) => a[0]-b[0])
                    
                        const series = new TimeSeries({
                            name: `history_cpu`,
                            columns: ["time", `com_${index}`],
                            points: points_cpu
                          });

                        return  <LineChart key={`cpu_1`} axis="price" columns={[`com_${index}`]} series={series} style={style} />
                    })
                    :
                    groupByHostSorted.map( (data,index) => {
                        
                        const points = grabeByHost[data]
                        const points_cpu = points
                        .map(item => [item.time, item.memory])
                        .sort((a,b) => a[0]-b[0])
                    
                        const series = new TimeSeries({
                            name: `history_memory`,
                            columns: ["time", `com_${index}`],
                            points: points_cpu
                          });
                    
                        return  <LineChart key={`memory_1`} axis="price" columns={[`com_${index}`]} series={series} style={style} />
                    })

                    }

                </Charts>
            </ChartRow>
        </ChartContainer>
    </div>
    <div>
        <Legend
            type="line"
            align="right"
            stack={true}
            style={style}
            categories={groupByHostSorted.map((key,index) => {
                return { 
                    key: `com_${index}`, 
                    label: key 
                }
            })}
        />
    </div>
    <Button onClick={() => setFilter(!filter0)}>{(filter0)? 'show CPU' : 'show MEMORY'}</Button>
    {setTime&&<Dropdown
        selection
        options = {options}
        defaultValue = {900000}
        onChange = {(e,data) => {
            setStartTime(new Date(currentTime.getTime() - data.value))
        }}
    />}

    </>
    
}