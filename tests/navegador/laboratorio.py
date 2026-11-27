import os, json
from pathlib import Path
from playwright.sync_api import sync_playwright
out=Path(os.environ.get("NORKA_LAB_OUT","/tmp/norka-laboratorio"))
url=(out/"laboratorio-norka.html").as_uri()
with sync_playwright() as p:
    browser=p.chromium.launch()
    page=browser.new_page(viewport={"width":390,"height":844})
    external=[]
    page.on("request", lambda req: external.append(req.url) if req.url.startswith(("http:","https:")) else None)
    page.route("http**/*",lambda r:r.abort())
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.goto(url)
    page.get_by_role("heading",name="Laboratorio de IA").wait_for()
    assert page.locator("#resultados .version").count()==2
    assert page.locator("#corpus option").count()==5
    assert page.locator("#b").input_value()=="7.4"
    page.screenshot(path=str(out/"laboratorio-movil-oscuro.png"),full_page=True)
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    page.locator("#tema").click()
    assert page.locator("html").get_attribute("data-tema")=="claro"
    page.screenshot(path=str(out/"laboratorio-movil-claro.png"),full_page=True)
    page.locator("#capa").select_option("aplicable")
    assert page.get_by_text("Precisión de propuesta: no medida").count()==2
    page.locator("#capa").select_option("resultado")
    page.locator("#revision-items").get_by_role("button",name="Confirmar",exact=True).first.click()
    assert page.get_by_text("Confirmada (simulación)").count()==1
    page.locator("#deshacer").click()
    assert page.get_by_text("Confirmada (simulación)").count()==0
    page.locator("#revision-items").get_by_role("button",name="Editar",exact=True).first.click()
    page.get_by_label("Título de la tarea").fill("Prueba ficticia de edición")
    page.get_by_role("button",name="Aplicar cambio").click()
    assert page.get_by_role("heading",name="Prueba ficticia de edición").count()==1
    page.locator("#revision-items").get_by_role("button",name="Descartar",exact=True).first.click()
    assert page.get_by_text("Descartada (simulación)").count()==1
    page.locator("#reiniciar").click()
    assert page.get_by_role("heading",name="Prueba ficticia de edición").count()==0
    page.locator("#corpus").select_option("46034647175")
    page.locator("#caso").select_option("6")
    page.locator("#a").select_option("7.4")
    page.locator("#b").select_option("6.0")
    assert page.get_by_text("Faltan 1 acciones según el conjunto sintético.",exact=True).count()==1
    assert page.get_by_text("Sobran 1 acciones según el conjunto sintético.",exact=True).count()==1
    page.locator("summary").click()
    assert page.get_by_text("Referencia sintética: 2 acciones").is_visible()
    page.screenshot(path=str(out/"laboratorio-cobertura.png"),full_page=True)
    page.locator("#corpus").select_option("45928250323")
    assert page.locator("#caso option").count()==12
    page.locator("#caso").select_option("6")
    page.locator("#a").select_option("7.2")
    page.locator("#capa").select_option("aplicable")
    assert page.get_by_text("Hora sugerida: 09:30",exact=False).count()>=1
    page.set_viewport_size({"width":360,"height":800})
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    page.set_viewport_size({"width":1280,"height":900})
    page.screenshot(path=str(out/"laboratorio-escritorio.png"),full_page=True)
    page.reload()
    assert page.get_by_role("heading",name="Prueba ficticia de edición").count()==0
    assert external==[],external
    assert errors==[],errors
    print("LAB_BROWSER_OK: 5 fuentes, comparación, capas, hora pendiente, edición, confirmación, descarte, undo, reinicio, 360/390/1280, claro/oscuro, sin solicitudes externas")
    browser.close()
