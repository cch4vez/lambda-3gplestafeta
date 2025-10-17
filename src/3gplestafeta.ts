import { APIGatewayProxyHandler } from "aws-lambda";
import { RequestModel, EstafetaResponse } from './models/RequestModel'
import axios from 'axios'
import convert from 'xml-js'

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('******************** INICIA GENERACION GUIA DE ENVIO ********************')
  const enviaRequest: RequestModel = event.body ? JSON.parse(event.body) : event
  const responseEstafeta: EstafetaResponse = { description: 'xxx', statusCode: 666 }
  console.log(JSON.stringify(enviaRequest, null, 4))

  console.log('******************** INICIA GENERACION GUIA DE ENVIO ********************')
  const {
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

  console.log('******************** INICIA LLAMADA A ESTAFETA ********************')


  console.log('******************** GENERA IMAGENES BASE64 ********************')
  // const imageEnvio = await axios.get(enviaRequest.origin.enviaResponse.data[0].label, { responseType: 'arraybuffer' });
  const imageEnvio = await axios.get(enviaRequest.service3pl.envio.new_pdf, { responseType: 'arraybuffer' });
  const rawEnvio = Buffer.from(imageEnvio.data).toString('base64');
  const base64ImageEnvio = rawEnvio;

  // const imageReturn = await axios.get(enviaRequest.return.enviaResponse.data[0].label, { responseType: 'arraybuffer' });
  const imageReturn = await axios.get(enviaRequest.service3pl.retorno.new_pdf, { responseType: 'arraybuffer' });
  const rawReturn = Buffer.from(imageReturn.data).toString('base64');
  const base64ImageReturn = rawReturn;
  let servicio = '';


  const xmlEnvia = `<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:com=\"http://comercio.webservices.redprairie.com/\">
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
                                <pedido>${enviaRequest.origin.inputBody.clave_pedido}</pedido>
                                <MetodoEnvio>${enviaRequest.origin.enviaResponse.data[0].carrier}</MetodoEnvio>
                                <Servicio>${enviaRequest.service3pl.envio.id_service_3pl}</Servicio> 
                                <guia>${enviaRequest.origin.enviaResponse.data[0].trackingNumber}</guia>
                                <imagen>${base64ImageEnvio}</imagen>
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

  console.log(xmlEnvia)

                                    

  let responseSoap
  try {
    console.log("Entro al try")
    
    responseSoap = await axios({
    //   url: 'https://wswmsqa.estafeta.com/wmtaf_ecommerce/RedprairieInboundTransactions?wsdl',
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
