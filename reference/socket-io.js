import React, { Component } from 'react';
import './App.css';
const chat_output_style = {
    height: "70vh", textAlign: "left", margin: "20px 20px"
};

const text_area_style = {
    height: "15vh",
    width: "50vw",
    padding: "10px"
};
class App extends Component {
    constructor(props){
        super(props);

        this.state = {
            text: "", message: [], userID: 0,
        };

        this.web_socket_server = new WebSocket("ws://localhost:8080/");

    }

    componentDidMount(){
        this.setState({userID: Math.floor(Math.random() * 100)});
        this.setUpSocket();
    }

    setUpSocket(){

        this.web_socket_server.onopen = (e) => {
            this.web_socket_server.send(
                JSON.stringify({
                    'type':'socket',
                    'user_id':Math.floor(Math.random() * 100)
                })
            )
        };

        this.web_socket_server.onerror = (e) => {
            console.log(e);
        };

        this.web_socket_server.onmessage = (e) => {
            let message = JSON.parse(e.data);
            switch (message.type){
                case 'chat':
                    this.state.message.push(message.msg);
                    this.setState({message:this.state.message});
                    break;
                case 'typing':
                    this.state.message.push(message.msg);
                    this.setState({message:this.state.message});
                    break;
                default:
                    console.log("null");
            }
        }

    }

    getMessages(){
        if(this.state.message.length < 1) return (<li>No message available</li>);

        let contentArray = [];

        this.state.message.map((o,i) => {
            contentArray.push(
                <li key={i} dangerouslySetInnerHTML={{__html: o}}/>
            )
        });

        return contentArray;
    }

    sendMessage(type = 'chat'){
        this.web_socket_server.send(
            JSON.stringify({
                'type':type,
                'user_id': this.state.userID,
                'chat_msg': this.state.text,
            })
        );

        if(type === 'chat'){
            this.setState({text: ""});
        }

    }

    userTyping(){
        this.sendMessage('typing');
    }

    render() {
        return (
            <div className="App">
                <div id="chat_output" style={chat_output_style}>
                    {this.getMessages()}
                </div>
                <form onSubmit={(e) => [e.preventDefault(), this.sendMessage()]}>
        <textarea value={this.state.text} onChange={e => [this.setState({text: e.target.value}), this.userTyping()]}
                  id="chat_input" style={text_area_style} placeholder="Enter your message"> </textarea>
                    <button style={{display: "block", marginLeft: "24.3%", marginTop: "10px", width: "120px", height:"30px"}}>Submit</button>
                </form>
            </div>
        );
    }
}

export default App;
