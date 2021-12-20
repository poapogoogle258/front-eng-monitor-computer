import { useState, useEffect } from "react";
import DataTable from 'react-data-table-component';
import {useParams} from 'react-router-dom'

import ChartStatus from '../components/ChartsStatus'


function check_status_service(node_service){

    if (node_service.length == 0){
        return 'no service'
    }
    
    const service_error = node_service.filter(item => item.status != 'online')
    if (service_error.length == 0){
        return 'nomal'
    }
    else{
        return service_error.map(item => `${item.name}:${item.status}`).join(',')
    }
    
}

export default function History(pros) {

    const {date} = useParams()

    const [data,setData] = useState([])

    const [timeStart,serTimeStart] = useState(new Date(2021,11,1,0,0,0,0))
    const [timeEnd,setTimeEnd] = useState(new Date(2021,11,1,23,59,59,0))

    const [loadfinish,serLoadfinish] = useState(false)
    const [loadError,setLoadError] = useState(false)



    const columns_log = [
        {
            name: 'host',
            selector: row => row.host,
        },
        {
            name: 'CPU(%)',
            selector: row => row.cpu,
        },
        {
            name: 'Memory(%)',
            selector: row => row.memory,
        },
        {
            name: 'Service_node',
            selector: row => row.service,
        },
        {
            name: 'Service_Nginx',
            selector: row => row.nginx,
        },
        {
            name: 'Time',
            selector: row => row.time,
        },
    ]


    useEffect(() => {
        async function getData() {
            const hostServer  = 'http://localhost:3000'
            const res = await fetch(`${hostServer}/api/history/${date}`)
            if (res.status == 200) {
                const datalog = await res.json()
                setData(datalog)
                serLoadfinish(true)
            }
            else{
                setLoadError(true)
            }    
        }
        getData()
    },[])

    console.log(timeStart,timeEnd)

    return <div>
        {loadError? `not found file datalog in ${date}`
        : 
        <div>
            //graph
            <ChartStatus enablePanZoom={true} data={data} timeStart={timeStart} timeEnd={timeEnd}/>
            //table
            <DataTable
                title={`Log history of ${date}`}
                data={data.map(item => {
                    return {
                        ...item,
                        'service' : check_status_service(item.node_service),
                        'nginx' : (item.nginx)? 'runing' : 'stop',
                        'time' :  (item.time === undefined)? new Date().toString() : new Date(item.time).toString()
                    }
                })}
                columns={columns_log}
                progressPending={!loadfinish}
                pagination
            />
        </div>
        }
    </div>
}