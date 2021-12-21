import { useState, useEffect } from "react";
import socketIOClient from 'socket.io-client'

import DataTable from 'react-data-table-component';
import { Grid } from "semantic-ui-react";


import MenuComputer from "../components/MenuComputer";
import ChartStatus from "../components/ChartsStatus";

export default function App(){

    const [history0,setHistory] = useState([])
    const [computer,setComputer] = useState({})
    const [timeEnd,serTimeEnd] = useState(new Date())
    const [loadfinish,setloadfinish] = useState(false)
    const [selectName,setSelectName] = useState('all')

    const endpoint = "http://monitor.obotrons.net:3000"
    const socket = socketIOClient(endpoint,{
        autoConnect : true,
        // reconnection: false
    })

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

    const columns_computer = [
        {
            name: 'connection',
            selector: row => row.connected,
        },
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
            name: 'Service',
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

    useEffect(()=>{
        async function open_socket(){
            let status;
            let history;


            const dataa = await fetch(`${endpoint}/api/history`)
            console.log(dataa)

            await socket.open()
  	    console.log(endpoint)          
            socket.emit('listen','join_room_status',(data) => {
                status = data.status
                history = data.history.map(his => {
                    return {
                        'host':his.host,
                        'cpu' : his.cpu,
                        'memory': his.memory,
                        'nginx' : his.nginx,
                        'service' : check_status_service(his.node_service),
                        'time' : his.time
                    }
                })

                setComputer(status)
                setHistory(history)
            })

            socket.on('loging',async function(log_history){
                status[log_history.host] = log_history

                const newData = {
                    'host':log_history.host,
                    'cpu' : log_history.cpu,
                    'memory': log_history.memory,
                    'nginx' : log_history.nginx,
                    'service' : check_status_service(log_history.node_service),
                    'time' :  log_history.time
                }

                history = [newData, ...history ]
                setHistory(history)
                setComputer(status)
            })
            setloadfinish(true)
        }
        // get_data() 
        open_socket()
        setInterval(() => {
            serTimeEnd(new Date())
        }, 2000);

        return () => socket.close()

    },[])

    return <div>
            <Grid centered>
                <Grid.Row>
                    <Grid.Column width={3}>
                        <MenuComputer sethost={setSelectName} select={selectName} host_computers={ ['all'].concat(Object.keys(computer))}/>
                    </Grid.Column>
                    <Grid.Column width={13}>
                        //graph
                        {(history0.length > 0)&&<ChartStatus timeEnd={timeEnd} setTime={true} data={history0.filter(item => (selectName=='all' || selectName === item.host))}/>}
                        
                        <br/>
                        //status now
                        <DataTable
                            title="Status Computer  "
                            data = {Object.values(computer)
                                .filter(item => (selectName=='all' || selectName === item.host))
                                .map(com => {
                                return {
                                    'host':com.host,
                                    'cpu' : com.cpu,
                                    'memory': com.memory,
                                    'connected' : com.connected? 'Online' : 'Offline',
                                    'service' : check_status_service(com.node_service),
                                    'nginx' : (com.nginx)? 'runing' : 'stop',
                                    'time' :  (com.time === undefined)? new Date().toString() : new Date(com.time).toString()
                                }
                            })}
                            columns = {columns_computer}
                            progressPending={!loadfinish}
                        />

                        //log data
                        <DataTable
                            title="Log history"
                            data={history0
                                .filter(item => (selectName=='all' || selectName === item.host))
                                .map(item => {
                                return {
                                    ...item,
                                    'nginx' : (item.nginx)? 'runing' : 'stop',
                                    'time' : (item.time === undefined)? new Date().toString() : new Date(item.time).toString()
                                }
                            })}
                            columns={columns_log}
                            progressPending={!loadfinish}
                            pagination
                        />

                    </Grid.Column>
                </Grid.Row>
            </Grid>
    </div>
}




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


