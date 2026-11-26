"""Audita los 28 componentes y 16 combinaciones de marca del catálogo, sin datos reales."""
import asyncio, json, os
from pathlib import Path
from playwright.async_api import async_playwright, expect
URL=os.environ["NORKA_URL"]
OUT=Path(os.environ["NORKA_QA_OUT"])
AXE=os.environ["NORKA_AXE"]
async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    resultados=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch()
        page=await browser.new_page(viewport={"width":360,"height":800},device_scale_factor=1,is_mobile=True,has_touch=True)
        errores=[]
        page.on("pageerror",lambda e:errores.append(str(e)))
        for tema in ("oscuro","claro"):
            await page.goto(URL+"/muestra")
            await page.evaluate("(t)=>document.documentElement.dataset.tema=t",tema)
            await page.evaluate("document.fonts.ready")
            for i in range(1,29):
                await expect(page.locator(f"#m{i} > h2")).to_contain_text(f"7.{i} ·")
            await expect(page.locator("#marca figure")).to_have_count(16)
            await page.add_script_tag(path=AXE)
            infracciones=await page.evaluate('async()=> (await axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}})).violations.map(v=>({id:v.id,nodos:v.nodes.map(n=>n.target)}))')
            ancho=await page.evaluate("document.documentElement.scrollWidth")
            resultados.append({"tema":tema,"componentes":28,"marca":16,"ancho":ancho,"infracciones":infracciones})
            await page.screenshot(path=str(OUT/f"catalogo-{tema}.png"),full_page=True)
        await browser.close()
    (OUT/"catalogo.json").write_text(json.dumps({"resultados":resultados,"errores":errores},ensure_ascii=False,indent=2))
    print(json.dumps(resultados,ensure_ascii=False,indent=2))
    assert not errores,errores
    assert all(x["ancho"]<=360 and not x["infracciones"] for x in resultados),resultados
asyncio.run(main())
