import { Container, List,Divider, Header, Item } from "semantic-ui-react";

export default function MenuComputer(pros){
    const {host_computers , sethost, select} = pros

    return <Container style ={{margin : '10px'}}>
        <List>
            <List.Header>
                <Header>
                    Computers
                </Header>
            </List.Header>
            <Divider />
            {host_computers.map(item => <>
                <List.Item key={item} value={item} onClick={(e,v) => sethost(v.value)}>
                    <Item.Content verticalAlign='middle' style={{margin:'5px'}} text>
                             {(select === item) &&<List.Icon name='bell' />}{item}
                    </Item.Content>
                </List.Item>
                <Divider />
            </>)}
        </List>    
    </Container>

}