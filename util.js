import B64js from "base64-js";

export const b64UrlDecode  = (b64UrlString) =>{
    b64UrlString = b64UrlString.replace(/\-/g, "+").replace(/\_/g, "/");
    let padding;
    b64UrlString.length % 4 == 0
        ? (padding = 0)
        : (padding = 4 - (b64UrlString.length % 4));
    return b64UrlString.concat("=".repeat(padding));
}


export const b64UrlToBuffer = (b64UrlString) =>{
    return new Uint8Array(B64js.toByteArray(b64UrlDecode(b64UrlString)));
}


export const fromHexString = hexString =>
    new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));