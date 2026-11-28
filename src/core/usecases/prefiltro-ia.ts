// Pure, conservative additional barrier. Never authorizes a transmission by itself.
export type MotivoPrefiltro="telefono"|"rut"|"correo"|"tarjeta_cuenta"|"tratamiento";
export function debeOmitirIA(texto:string):{omitir:boolean;motivo:MotivoPrefiltro|null}{
 const t=texto.normalize("NFKD").replace(/\p{M}/gu,"").toLowerCase(),res=(motivo:MotivoPrefiltro)=>({omitir:true,motivo});
 if(/\b\d{1,2}(?:\.\d{3}){2}-[\dk]\b|\b\d{7,8}-[\dk]\b|\b(?:rut|run|cedula de identidad)\b/.test(t))return res("rut");
 if(/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b|\b(?:correo|email)\s+(?:es|electronico|de contacto)\b/.test(t))return res("correo");
 if(/(?:^|[^\d])(?:\+?56[\s.-]*)?9(?:[\s.-]*\d){8}(?!\d)|\b(?:telefono|celular|fono|whatsapp|numero de contacto)\b/.test(t))return res("telefono");
 if(/(?:^|[^\d])(?:\d[\s-]*){13,19}(?!\d)|\b(?:cuenta corriente|cuenta vista|cuenta rut|numero de cuenta|tarjeta de credito|tarjeta de debito|cvv|clave bancaria|iban)\b/.test(t))return res("tarjeta_cuenta");
 if(/\b(?:tratamiento|dosis|medicamento|remedio|jarabe|comprimidos?|capsulas?|insulina|antibiotico|inhalador|diagnostico|historia clinica)\b|\b\d+(?:[.,]\d+)?\s*(?:ml|mg|mcg|ug|gotas|comprimidos?|capsulas?|unidades de insulina)\b|\b(?:cada|en intervalos de)\s+\d+\s*horas\b/.test(t))return res("tratamiento");
 return {omitir:false,motivo:null};
}
