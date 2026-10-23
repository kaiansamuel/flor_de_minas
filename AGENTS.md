# Repository Guidelines

## Estrutura do projeto

A aplicação usa React e Vite. `src/App.jsx` é a entrada React; `src/components/OriginalExperience.jsx` monta a experiência original e inicia seus efeitos. O HTML e os scripts preservados ficam em `src/legacy/`, e os estilos originais e globais ficam em `src/styles/`. `public/assets/` contém imagens e bibliotecas locais capturadas, incluindo Three.js e Tailwind. O `index.html` da raiz contém metadados em pt-BR.

## Desenvolvimento, build e validação

- `npm install`: instala as dependências descritas em `package.json`.
- `npm run dev`: inicia o servidor local do Vite.
- `npm run build`: gera os arquivos de produção em `dist/`.
- `npm run preview`: serve localmente o build para revisão.

Não há suíte automatizada configurada. Ao alterar a página, confira navegação, FAQ, modal, rolagem, imagens e animação WebGL no desktop e no celular.

## Convenções de código

Use JavaScript/JSX, componentes funcionais e hooks React. Mantenha os identificadores e classes do HTML original: os scripts de `src/legacy/` usam esses seletores para sincronizar scroll, galeria e canvas. Preserve o CSS e os parâmetros Three.js ao adaptar textos ou comportamentos. Evite dependências adicionais quando os recursos locais existentes forem suficientes.

## Recursos e conteúdo

Mantenha os arquivos de `public/assets/` no repositório e prefira caminhos locais; a aplicação deve funcionar sem buscar imagens no Supabase. O conteúdo deve permanecer em português brasileiro e a marca deve ser Panificadora Flor de Minas. Não invente informações comerciais: endereço informado é Jardim Guanabara, Goiânia - GO; telefone, horários, preços oficiais e redes sociais dependem de confirmação. Os produtos e valores exibidos são os do material original e permanecem identificados como apresentação provisória.

## Commits e pull requests

Não há histórico Git disponível para inferir uma convenção local. Use mensagens curtas e descritivas, como `Ajusta navegação mobile`. Descreva mudanças e validações no pull request; inclua capturas de tela quando a alteração afetar a apresentação visual.
