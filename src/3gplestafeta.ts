import { APIGatewayProxyHandler } from "aws-lambda";
import { RequestModel, EstafetaResponse } from './models/RequestModel'
import axios from 'axios'
import convert from 'xml-js'

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('******************** INICIA GENERACION GUIA DE ENVIO ********************')
  const enviaRequest: RequestModel = event?.body ? JSON.parse(event?.body) : event
  console.log("event: " + JSON.stringify(event?.body))
  console.log("event keys: " + Object.keys(JSON.stringify(enviaRequest)))
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

  // console.log('enviaRequest ' + enviaRequest)
  // console.log('enviaRequest ' + JSON.stringify(enviaRequest))

  
  // // console.log('enviaRequest ' + JSON.stringify(event.body))

  console.log('enviaRequest.service3pl ' + JSON.stringify(enviaRequest.service3pl))

  console.log('enviaRequest.service3pl.envio.new_pdf ' + JSON.stringify(enviaRequest.service3pl.envio.new_pdf))
  console.log('enviaRequest.service3pl.retorno.new_pdf ' + JSON.stringify(enviaRequest.service3pl.retorno.new_pdf))


  console.log('enviaRequest.service3pl.envio.new_pdf sin JSON.stringify' + enviaRequest.service3pl.envio.new_pdf)
  console.log('enviaRequest.service3pl.retorno.new_pdf sin JSON.stringify ' + enviaRequest.service3pl.retorno.new_pdf)

  


  console.log('******************** GENERA IMAGENES BASE64 ********************')
  // const imageEnvio = await axios.get(enviaRequest.origin.enviaResponse.data[0].label, { responseType: 'arraybuffer' });
  const imageEnvio = await axios.get(enviaRequest.service3pl.envio.new_pdf, { responseType: 'arraybuffer' });
  console.log("imageEnvio " + imageEnvio)
  const rawEnvio = Buffer.from(imageEnvio.data).toString('base64');
  console.log("rawEnvio " + rawEnvio)
  const base64ImageEnvio = rawEnvio;
  console.log("base64ImageEnvio " + base64ImageEnvio)


  // const imageReturn = await axios.get(enviaRequest.return.enviaResponse.data[0].label, { responseType: 'arraybuffer' });
  const imageReturn = await axios.get(enviaRequest.service3pl.retorno.new_pdf, { responseType: 'arraybuffer' });
  console.log("imageReturn " + imageReturn)
  const rawReturn = Buffer.from(imageReturn.data).toString('base64');
  console.log("rawReturn " + rawReturn)
  const base64ImageReturn = rawReturn;
  console.log("base64ImageReturn " + base64ImageReturn)
  let servicio = '';

  console.log("*************************** ants de las propiedades ******")

  console.log("pedido envio  ***: " + JSON.stringify(enviaRequest.origin.inputBody.clave_pedido))

  console.log("metodoEnvio envio: " + JSON.stringify(enviaRequest.origin.enviaResponse.data[0].carrier))
  console.log("servicio envio: " + JSON.stringify(enviaRequest.service3pl.envio.id_service_3pl))
  console.log("guia envio: " + JSON.stringify(enviaRequest.origin.enviaResponse.data[0].trackingNumber))
  console.log("imagen envio: " + base64ImageEnvio)

  console.log("metodoEnvio retorno: " + JSON.stringify(enviaRequest.return.enviaResponse.data[0].carrier))
  console.log("servicio retorno: " + JSON.stringify(enviaRequest.service3pl.retorno.id_service_3pl))
  console.log("guia retorno: " + JSON.stringify(enviaRequest.return.enviaResponse.data[0].trackingNumber))
  console.log("imagen retorno: " + base64ImageReturn)




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


  // enviaRequest.origin.estafetaResponse = responseEstafeta


  // console.log('******************** INICIA LLAMADA LAMBDA DE PERSISTENCIA ENVIO ********************')
  // try {

  //   var config = {
  //     method: 'post',
  //     url: 'https://2epl5gawn42tjjjw3d47p2jgay0gxcjy.lambda-url.us-east-1.on.aws/', //intlog-dev-insert-ctrl-IntegradorInsertFunction-Fo2jAm33wrur
  //     url : 'https://umvi5z4w3wbnc3pckvsw4vczx40bcfwl.lambda-url.us-east-1.on.aws/', //intlog-prod-insert-ctrl-IntegradorInsertFunction-UJOAbi4FGyfd
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     data: JSON.stringify(enviaRequest.origin)
  //   };

  //   const responseEnvio = await axios(config)
  //   console.log('******************** PERSISTENCIA ENVIO RESPONDE ********************')
  //   console.log(responseEnvio.data)
  //   enviaRequest.origin.responseInsert = responseEnvio.data

  // } catch (error) {
  //   console.log('ERROR AL LLAMAR AL INSERT DE ENVIO')
  //   console.log(error)
  // }

  // console.log('******************** INICIA LLAMADA LAMBDA DE PERSISTENCIA RETORNO ********************')
  // try {
  //   var config = {
  //     method: 'post',
  //     url: 'https://xit6pe2dwi7ikm4kujbb5ulswe0mlerl.lambda-url.us-east-1.on.aws/s', //intlog-dev-3GplEstafetaReturn
  //     url: 'https://5pdpjcoocdv4tnc7comrgm2vte0gcsnu.lambda-url.us-east-1.on.aws/', // intlog-3GplEstafetaReturn-prod-3GplEstafetaReturn
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     data: JSON.stringify(enviaRequest.return)
  //   };

  //   const responseReturn = await axios(config)
  //   console.log('******************** PERSISTENCIA RETORNO RESPONDE ********************')
  //   console.log(responseReturn.data)
  //   enviaRequest.return.responseInsert = responseReturn.data
  // } catch (error) {
  //   console.log('ERROR AL LLAMAR AL INSERT DE RETORNO')
  //   console.log(error)
  // }

  // console.log(JSON.stringify(enviaRequest, null, 4))

  return {
    statusCode: 200,
    body: JSON.stringify(enviaRequest)
  }
};
