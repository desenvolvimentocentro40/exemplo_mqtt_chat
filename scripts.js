const txtnome=document.getElementById("txtnome")
const txtmensagem=document.getElementById("txtmensagem")
const chatmensagens=document.getElementById("chatmensagens")
const led=document.getElementById("led")
const topico="SenaiCentro4.0Contagem/2025/chat"

txttopico.innerHTML=`Tópico: ${topico}`

const BROKER_HOST = 'mqtt-dashboard.com'
const BROKER_PORT = 8884
const BROKER_USER = ''
const BROKER_PASS = ''
const CLIENT_ID = "exmploLampada_" + parseInt(Math.random() * 10000)

let client = new Paho.MQTT.Client(BROKER_HOST, BROKER_PORT, CLIENT_ID)

function conectarMQTT(){
    const connectOptions = {
        useSSL: true,
        userName: BROKER_USER,
        password: BROKER_PASS,
        onSuccess: onConnect, // Função que será chamada no sucesso
        onFailure: onFailure, // Função que será chamada na falha
        timeout: 5
    }
    desconectarMQTT()
    client.connect(connectOptions);
    led.classList.remove("led_desconectado")
    led.classList.remove("led_erro")
    led.classList.remove("led_conectado")
    led.classList.add("led_conectando")
}

const desconectarMQTT=()=>{
    if (client && client.isConnected && client.isConnected()) {
        client.disconnect()
        led.classList.remove("led_erro")
        led.classList.remove("led_conectado")
        led.classList.remove("led_conectando")
        led.classList.add("led_desconectado")
    }
}

function onConnect(){
    led.classList.remove("led_erro")
    led.classList.remove("led_conectando")
    led.classList.remove("led_desconectado")
    led.classList.add("led_conectado")
	client.subscribe(topico)
}

function onFailure(responseObject){
    led.classList.remove("led_conectando")
    led.classList.remove("led_desconectado")
    led.classList.remove("led_conectado")
    led.classList.add("led_erro")
}

function onConnectionLost(responseObject){
	if (responseObject.errorCode !== 0) {
        led.classList.remove("led_conectando")
        led.classList.remove("led_conectado")
        led.classList.remove("led_erro")
        led.classList.add("led_desconectado")
	}
}

function publish(){
    const dados={
        "nome":txtnome.value,
        "msg":txtmensagem.value
    }
    const pahoMessage = new Paho.MQTT.Message(JSON.stringify(dados))
    pahoMessage.destinationName = topico
	pahoMessage.retained = true
    client.send(pahoMessage)
}

function onMessageArrived(message){
	const topico = message.destinationName
	const payload = message.payloadString
    criarBlocoMensagem(payload)
}

function criarBlocoMensagem(msg){
    const data=new Date()
    const dataPronta = `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()} - ${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}:${String(data.getSeconds()).padStart(2, '0')}`
    const dados=JSON.parse(msg)
    const div=document.createElement("div")
    const p_de=document.createElement("p")
    const p_msg=document.createElement("p")
    const span_data=document.createElement("span")
    div.classList.add("mensagem")
    p_de.innerHTML=`De: ${dados.nome} - `
    p_msg.classList.add("textoMensagem")
    span_data.innerHTML=dataPronta
    span_data.classList.add("dataMensagem")
    p_msg.innerHTML=`${dados.msg}`
    p_de.appendChild(span_data)
    div.appendChild(p_de)
    div.appendChild(p_msg)
    chatmensagens.appendChild(div)
    txtmensagem.value=""
    txtmensagem.focus()
}

client.onConnectionLost = onConnectionLost
client.onMessageArrived = onMessageArrived


conectarMQTT()
