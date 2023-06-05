export interface Coordinates {
    latitude: string;
    longitude: string;
}

export interface Origin {
    name: string;
    company: string;
    email: string;
    phone: string;
    street: string;
    number: string;
    district: string;
    city: string;
    state: string;
    category: number;
    country: string;
    postalCode: string;
    reference: string;
    identificationNumber: string;
    coordinates: Coordinates;
}

export interface Destination {
    name: string;
    company: string;
    email: string;
    phone: string;
    street: string;
    number: string;
    district: string;
    city: string;
    state: string;
    category: number;
    country: string;
    postalCode: string;
    reference: string;
    identificationNumber: string;
    coordinates: Coordinates;
}

export interface Dimensions {
    length: number;
    width: number;
    height: number;
}

export interface Package {
    content: string;
    boxCode: string;
    amount: number;
    type: string;
    weight: number;
    declaredValue: number;
    weightUnit: string;
    lengthUnit: string;
    dimensions: Dimensions;
}

export interface Shipment {
    carrier: string;
    type: number;
    service: string;
}

export interface Settings {
    printFormat: string;
    printSize: string;
    currency: string;
}

export interface EnviaBody {
    origin: Origin;
    destination: Destination;
    packages: Package[];
    shipment: Shipment;
    settings: Settings;
}

export interface InputBody {
    clave_pedido: string;
    id_ecom_envio: number;
    fecha_bus: Date;
    enviaBody: EnviaBody;
    event_db_timestamp: Date;
    type: string;
}

export interface Datum {
    carrier: string;
    service: string;
    shipmentId?: any;
    trackingNumber: string;
    trackUrl: string;
    label: string;
    additionalFiles: any[];
    totalPrice: number;
    currentBalance: number;
    currency: string;
}

export interface EnviaResponse {
    meta: string;
    data: Datum[];
}

export interface EstafetaResponse {
    description: string;
    statusCode: number;
}

export interface ResponseInsert {
    msg: string;
    sqlConnectionstatus: number;
}

export interface Origin {
    inputBody: InputBody;
    enviaResponse: EnviaResponse;
    estafetaResponse: EstafetaResponse;
    responseInsert: ResponseInsert
}

export interface Return {
    inputBody: InputBody;
    enviaResponse: EnviaResponse;
    estafetaResponse: EstafetaResponse;
    responseInsert: ResponseInsert
}

export interface RequestModel {
    origin: Origin;
    return: Return;
}

