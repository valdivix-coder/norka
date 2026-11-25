"""Recorrido móvil emulado de rutas reales, con REST local de prueba; no OAuth ni Supabase real."""
import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright, expect
from servidor_qa import FAMILIA, PERSONA, TOKEN

URL = os.environ.get("NORKA_URL", "http://127.0.0.1:3191")
BASE = f"{URL}/familia/{FAMILIA}"
OUT = Path(os.environ.get("NORKA_QA_OUT", "/tmp/norka-evidencia"))
AXE = os.environ.get("NORKA_AXE")
resultados = {"rutas": [], "controles": [], "errores_js": [], "axe": []}

async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            viewport={"width":360,"height":800}, device_scale_factor=1,
            is_mobile=True, has_touch=True,
            record_video_dir=str(OUT/"video"), record_video_size={"width":360,"height":800})
        page = await context.new_page()
        page.on("pageerror", lambda error: resultados["errores_js"].append(str(error)))
        await page.goto(BASE+"/hoy")
        await expect(page).to_have_url(URL+"/entrar")
        resultados["controles"].append("Sin sesión, ruta protegida redirige a entrar")
        await context.add_cookies([{"name":"norka_sesion","value":TOKEN,"url":URL,"httpOnly":True,"sameSite":"Lax"}])
        await page.goto(BASE+"/hoy")
        nav=page.get_by_role("navigation",name="Navegación principal")
        async def pantalla(nombre, ruta):
            await expect(page.get_by_role("heading",name=nombre,exact=True)).to_be_visible()
            await page.evaluate("document.fonts.ready")
            ancho=await page.evaluate("document.documentElement.scrollWidth")
            assert ancho<=360,(nombre,ancho)
            assert "/muestra/" not in page.url,page.url
            resultados["rutas"].append({"pantalla":nombre,"ruta":ruta,"ancho":ancho})
            if AXE:
                await page.add_script_tag(path=AXE)
                v=await page.evaluate('async()=> (await axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}})).violations.map(v=>({id:v.id,impact:v.impact,nodos:v.nodes.map(n=>n.target)}))')
                resultados["axe"].append({"pantalla":nombre,"infracciones":v})
            await page.screenshot(path=str(OUT/(ruta+".png")),full_page=True)

        await pantalla("Hoy","hoy")
        await nav.get_by_role("button",name="Capturar",exact=True).click()
        await expect(page.get_by_role("dialog")).to_be_visible()
        await page.keyboard.press("Escape")
        await expect(page.get_by_role("dialog")).to_have_count(0)
        resultados["controles"].append("Capturar abre y cierra hoja; no guarda datos ficticios")
        await nav.get_by_role("link",name="Familia",exact=True).click()
        await pantalla("Familia","familia")
        await expect(page.get_by_text("El hogar",exact=True).first).to_be_visible()
        await expect(page.get_by_text("Compras",exact=True)).to_be_visible()
        await page.evaluate("window.scrollTo(0,48)")
        await asyncio.sleep(0.15)
        valor=await page.evaluate('getComputedStyle(document.querySelector("main").parentElement).getPropertyValue("--recogida")')
        assert float(valor)>=0.99,valor
        await page.screenshot(path=str(OUT/"cabecera-recogida.png"))
        await page.get_by_role("button",name="Ir al inicio",exact=True).click()
        await page.wait_for_function("window.scrollY===0")
        resultados["controles"].append("Cabecera sigue el desplazamiento de 0 a 48 px y vuelve al inicio")
        await page.get_by_role("link",name="Persona de prueba",exact=True).click()
        await pantalla("Persona de prueba","persona")
        await expect(page).to_have_url(BASE+"/persona?id="+PERSONA)
        await page.get_by_role("button",name="Volver",exact=True).click()
        await expect(page.get_by_role("heading",name="Familia",exact=True)).to_be_visible()
        await page.get_by_role("link",name="Buscar",exact=True).click()
        await pantalla("Buscar","buscar")
        await page.get_by_role("searchbox").fill("persona")
        await page.get_by_role("link",name="Persona de prueba",exact=True).click()
        await expect(page.get_by_role("heading",name="Persona de prueba",exact=True)).to_be_visible()
        resultados["controles"].append("Ficha auténtica de prueba accesible desde Familia y Buscar")
        for nombre,ruta in [("Equilibrio","equilibrio"),("Actividad","actividad")]:
            await nav.get_by_role("link",name=nombre,exact=True).click()
            await pantalla(nombre,ruta)
        await page.get_by_role("link",name="Avisos",exact=True).click()
        await pantalla("Avisos","avisos")
        await page.get_by_role("link",name="Perfil",exact=True).click()
        await pantalla("Tu perfil","perfil")
        await page.get_by_role("button",name="Claro",exact=True).click()
        assert await page.evaluate("document.documentElement.dataset.tema")=="claro"
        await nav.get_by_role("link",name="Hoy",exact=True).click()
        await expect(page.get_by_role("heading",name="Hoy",exact=True)).to_be_visible()
        assert await page.evaluate("document.documentElement.dataset.tema")=="claro"
        await page.emulate_media(reduced_motion="reduce")
        await nav.get_by_role("link",name="Equilibrio",exact=True).click()
        await pantalla("Equilibrio","equilibrio-claro-reducido")
        await context.set_offline(True)
        await expect(page.get_by_text("Sin conexión.",exact=True)).to_be_visible()
        await context.set_offline(False)
        resultados["controles"].append("Tema, movimiento reducido y aviso sin conexión")
        await page.goto(URL+"/familia/00000000-0000-4000-8000-000000000099/hoy")
        await expect(page.get_by_text("Familia de prueba",exact=True)).to_have_count(0)
        await expect(page.get_by_role("navigation",name="Navegación principal")).to_have_count(0)
        resultados["controles"].append("Familia ajena: acceso denegado")
        await context.close()
        await browser.close()
    (OUT/"resultados.json").write_text(json.dumps(resultados,ensure_ascii=False,indent=2))
    print(json.dumps(resultados,ensure_ascii=False,indent=2))
    assert not resultados["errores_js"], resultados["errores_js"]
    assert not any(x["infracciones"] for x in resultados["axe"]),resultados["axe"]

asyncio.run(main())
