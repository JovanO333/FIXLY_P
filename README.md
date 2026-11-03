# Pruebas del Plan de Pruebas - Fixly

## Requisitos
Node.js 20+, Google Chrome, Git.

## Instalacion (una vez)
    npm install

## Ejecucion y evidencias (toma pantallazo de cada una)
1. Unitarias (Jest):        npm run test:unit
   Con cobertura:           npx jest --coverage
2. Integracion (Newman):    npm run test:api        -> genera evidencias/reporte-api.html
3. E2E (Cypress, headless): npx cypress run         -> videos en cypress/videos
   E2E (interactivo):       npx cypress open
4. Aceptacion (Gherkin):    npx cypress run --config-file cypress.cucumber.config.js
5. CI en GitHub: copia .github-workflow-ci.yml a .github/workflows/ci.yml y haz push a main.

## Notas
- ST-11 a ST-14 usan problem_user y pueden FALLAR: eso son bugs a reportar en Azure DevOps (BG-01 a BG-04).
- Si algun paquete de Gherkin falla al instalar, ejecuta primero solo los pasos 1 a 3.
