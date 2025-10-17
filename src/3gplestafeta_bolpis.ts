import { APIGatewayProxyHandler } from "aws-lambda";
import { RequestModel, EstafetaResponse, RequestModelBolpis } from './models/RequestModel'
import axios from 'axios'
import convert from 'xml-js'

const { Client } = require('pg');

export const handler: APIGatewayProxyHandler = async (event) => {

    

    const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: 5432,
        ssl: {
            rejectUnauthorized: false // necesario para que funcione con RDS sin importar el certificado
          }
      });
    
      



    console.log('******************** INICIA GENERACION GUIA DE ENVIO ********************')
    const enviaRequest: RequestModelBolpis = event.body ? JSON.parse(event.body) : event
    const responseEstafeta: EstafetaResponse = { description: 'xxx', statusCode: 666 }
    console.log(JSON.stringify(enviaRequest, null, 4))

    console.log('Claves de enviaRequest:')
    Object.keys(enviaRequest).forEach(key => console.log('-', key))

    let xmlEnvia
    let responseSoap

    let {
        cuenta,
        codigoAcceso,
        cliente,
        prueba,
        unidadNegocio
    } = {
        cuenta: 'AXO',
        codigoAcceso: 'P4$$w0rd',
        cliente: 'TAF',
        prueba: '0',
        unidadNegocio: 'MEX',
    }



    // Validación mutua de campos origin/return
    const hasOrigin = !!enviaRequest.origin;
    const hasReturn = !!enviaRequest.return;

    if (hasOrigin && hasReturn) {
        console.error('❌ Error: No se permite enviar ambos campos: origin y return.');
        return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Solicitud inválida: no se permite enviar ambos origin y return.' }),
        };
    }

    if (!hasOrigin && !hasReturn) {
        console.error('❌ Error: Se debe enviar al menos uno: origin o return.');
        return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Solicitud inválida: se requiere origin o return.' }),
        };
    }

    if (hasOrigin) {
        console.log('✅ Procesando guía con ORIGIN...');
        // lógica con enviaRequest.origin

            let albaran;
            let base64ImageEnvio;
            console.log('enviaRequest.service3pl:' + JSON.stringify(enviaRequest.service3pl))

            try{
                const imageEnvio = await axios.get(enviaRequest.service3pl.envio.new_pdf, { responseType: 'arraybuffer' });
                console.log('imagenEnvio')
                const rawEnvio = Buffer.from(imageEnvio.data).toString('base64');
                console.log('rawEnvio')
                base64ImageEnvio = rawEnvio;
                console.log('base64')
                albaran = enviaRequest.service3pl.envio.albaran;

            }catch(error){
                console.error('❌ Error imagen 64 origin:', error);
            }
            
        
        
            xmlEnvia = `<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:com=\"http://comercio.webservices.redprairie.com/\">
                            <soapenv:Header/>
                            <soapenv:Body>
                                <com:EnviaData>
                                    <!--Optional:-->
                                    <com:InputXML>
                                    <query>
                                        <credenciales>
                                            <com:cuenta>${cuenta}</com:cuenta>
                                            <com:codigoAcceso>${codigoAcceso}</com:codigoAcceso>
                                            <!--Optional:-->
                                            <com:cliente>${cliente}</com:cliente>
                                            <com:prueba>${prueba}</com:prueba>
                                            <!--Optional:-->
                                            <com:unidadNegocio>${unidadNegocio}</com:unidadNegocio>
                                        </credenciales>
                                        <pedido>${albaran}</pedido>
                                        <MetodoEnvio>${enviaRequest.origin.enviaResponse.data[0].carrier}</MetodoEnvio>
                                        <Servicio>${enviaRequest.service3pl.envio.id_service_3pl}</Servicio> 
                                        <guia>${enviaRequest.origin.enviaResponse.data[0].trackingNumber}</guia>
                                        <imagen>${base64ImageEnvio}</imagen>
                                        <!--Optional:-->
                                        <retorno>
                                            <MetodoEnvio></MetodoEnvio>
                                            <Servicio></Servicio> 
                                            <guia></guia>
                                            <imagen></imagen>
                                        </retorno>
                                    </query>
                                    </com:InputXML>
                                </com:EnviaData>
                            </soapenv:Body>
                            </soapenv:Envelope>`
    
    }

    if (hasReturn) {
        console.log('✅ Procesando guía con RETURN...');
            // lógica con enviaRequest.return

            let albaran;
            let base64ImageReturn;

            console.log('enviaRequest.service3pl:' + JSON.stringify(enviaRequest.service3pl))

            try{
                const imageEnvio = await axios.get(enviaRequest.service3pl.retorno.new_pdf, { responseType: 'arraybuffer' });
                console.log('imagenEnvio')
                const rawEnvio = Buffer.from(imageEnvio.data).toString('base64');
                console.log('rawEnvio')
                base64ImageReturn = rawEnvio;
                console.log('base64')
                albaran = enviaRequest.service3pl.retorno.albaran;

            }catch(error){
                console.error('❌ Error imagen 64: return', error);
            }

            // const imageReturn = await axios.get(enviaRequest.service3pl.retorno.new_pdf, { responseType: 'arraybuffer' });
            // const rawReturn = Buffer.from(imageReturn.data).toString('base64');
            // const base64ImageReturn = rawReturn;
        
        
            xmlEnvia = `<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:com=\"http://comercio.webservices.redprairie.com/\">
                            <soapenv:Header/>
                            <soapenv:Body>
                                <com:EnviaData>
                                    <!--Optional:-->
                                    <com:InputXML>
                                    <query>
                                        <credenciales>
                                            <com:cuenta>${cuenta}</com:cuenta>
                                            <com:codigoAcceso>${codigoAcceso}</com:codigoAcceso>
                                            <!--Optional:-->
                                            <com:cliente>${cliente}</com:cliente>
                                            <com:prueba>${prueba}</com:prueba>
                                            <!--Optional:-->
                                            <com:unidadNegocio>${unidadNegocio}</com:unidadNegocio>
                                        </credenciales>
                                        <pedido>${enviaRequest.return.inputBody.clave_pedido}</pedido>
                                        <MetodoEnvio></MetodoEnvio>
                                        <Servicio></Servicio> 
                                        <guia></guia>
                                        <imagen></imagen>
                                        <!--Optional:-->
                                        <retorno>
                                            <MetodoEnvio>${enviaRequest.return.enviaResponse.data[0].carrier}</MetodoEnvio>
                                            <Servicio>${enviaRequest.service3pl.retorno.id_service_3pl}</Servicio> 
                                            <guia>${enviaRequest.return.enviaResponse.data[0].trackingNumber}</guia>
                                            <imagen>${base64ImageReturn}</imagen>
                                        </retorno>
                                    </query>
                                    </com:InputXML>
                                </com:EnviaData>
                            </soapenv:Body>
                            </soapenv:Envelope>`
            
    }


    console.log('******************** INICIA LLAMADA A ESTAFETA ********************')

    console.log(xmlEnvia)
                                    

    try {
        console.log("Entro al try")
        
        responseSoap = await axios({
        // url: 'https://wswmsqa.estafeta.com/wmtaf_ecommerce/RedprairieInboundTransactions?wsdl',
        url: 'https://WsWms.estafeta.com:443/wmtaf_ecommerce/RedprairieInboundTransactions?wsdl',
        method: 'POST',
        headers: { 'Content-Type': 'text/xml' },
        data: xmlEnvia
        })

    } catch (errorSoap) {
        console.error('falla en la llamada al ws')
        console.error(errorSoap)
        responseSoap = errorSoap
    } finally {
        const result = responseSoap.data
        const soapToJson = convert.xml2json(responseSoap.data, { compact: true, spaces: 4 });
        console.log("Datos de soapToJson ")
        console.log(soapToJson)
        const objEstafeta = (JSON.parse(soapToJson)['soap:Envelope']['soap:Body']['EnviaDataResponse']['EnviaDataResult'])
        console.log("objetoEstafeta 3gplestafeta lambda")
        console.log(objEstafeta);
        responseEstafeta.statusCode = objEstafeta.resultado.statusCode._text
        responseEstafeta.description = objEstafeta.resultado.description._text
    }


    return {
        statusCode: 200,
        body: JSON.stringify(enviaRequest)
    }
};
