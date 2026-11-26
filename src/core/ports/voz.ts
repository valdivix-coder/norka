export interface SesionVoz { terminar():void; cancelar():void }
export interface PuertoVoz {
  disponible():boolean;
  iniciar(eventos:{texto:(texto:string)=>void;fin:(texto:string)=>void;error:(texto:string)=>void}):SesionVoz;
}
export interface PuertoVibracion { corta():void }
