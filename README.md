# StudyFlow – Planejador Inteligente de Estudos

App mobile em **React Native (Expo)** que gera automaticamente um cronograma de
estudos a partir das matérias, provas/trabalhos e da disponibilidade de tempo
do usuário. Funciona **100% offline**, salvando tudo localmente com
`AsyncStorage`.

## Requisitos atendidos

**Funcionais**
- RF01 – Cadastro de matérias (`aba Matérias`)
- RF02/RF03 – Cadastro de provas e trabalhos com data de entrega/prova (`aba Provas`)
- RF04 – Quantidade de conteúdo (em horas estimadas) por prova/trabalho
- RF05 – Dias e horários disponíveis para estudo (`Ajustes → Disponibilidade`)
- RF06 – Geração automática do cronograma (`src/utils/scheduler.js`)
- RF07 – Plano diário de estudos (`aba Hoje`)
- RF08 – Marcar sessão como concluída
- RF09 – Reorganização automática do cronograma quando uma sessão não é concluída
- RF10 – Progresso por matéria (barra de progresso na aba Matérias)
- RF11 – Notificações locais de lembrete (`expo-notifications`)
- RF12 – Persistência local com AsyncStorage

**Não funcionais**
- RNF01 – React Native (Expo)
- RNF02 – AsyncStorage
- RNF03 – Interface responsiva e intuitiva
- RNF04 – Funciona offline (nenhuma chamada de rede é feita pelo app)
- RNF05 – Algoritmo de geração roda em memória, em milissegundos
- RNF06 – Navegação simples via abas (React Navigation)

## Estrutura do projeto

```
StudyFlow/
├── App.js
├── app.json
├── babel.config.js
├── package.json
└── src/
    ├── assets/
    ├── components/       # SubjectCard, SessionCard, ProgressBar
    ├── context/           # AppContext.js – estado global do app
    ├── navigation/         # Tabs + stacks (React Navigation)
    ├── screens/            # Todas as telas do app
    ├── storage/            # Camada de persistência (AsyncStorage)
    ├── theme/              # Cores
    └── utils/
        ├── scheduler.js     # Algoritmo de geração/reorganização do cronograma
        └── notifications.js # Notificações locais
```

## Como rodar

Pré-requisitos: Node.js 18+ e o app **Expo Go** no celular (Android/iOS), ou um
emulador Android/iOS configurado.

```bash
# 1. Entrar na pasta do projeto
cd StudyFlow

# 2. Instalar as dependências
npm install

# 3. Iniciar o projeto
npx expo start
```

Depois disso:
- Escaneie o QR Code com o app **Expo Go** (Android) ou a câmera (iOS) para
  testar no celular, ou
- Pressione `a` no terminal para abrir num emulador Android, ou `i` para um
  simulador iOS (necessário macOS + Xcode).

## Como o cronograma é gerado (RF06/RF09)

1. Cada bloco de disponibilidade semanal (ex: "Segunda, 18h–20h") é fatiado em
   sessões de estudo (duração configurável em Ajustes, padrão 60 min).
2. Para cada prova/trabalho, calculamos quantas horas de conteúdo ainda faltam
   (total cadastrado menos o que já foi estudado).
3. As provas/trabalhos são ordenadas por urgência (data mais próxima primeiro).
4. Os horários livres são preenchidos na ordem cronológica, respeitando a data
   limite de cada prova/trabalho.
5. Quando o usuário marca uma sessão como **"Não deu tempo"**, o conteúdo dela
   volta para o saldo pendente daquela prova/trabalho, e o cronograma futuro é
   recalculado automaticamente para reencaixar esse conteúdo nos próximos
   horários livres.

## Rodando no navegador (web)

```bash
npx expo start --web
```

Funciona para navegação, cadastro de matérias/provas e visualização do
cronograma. Os seletores de **data e hora** (`@react-native-community/datetimepicker`
e `@react-native-picker/picker`) têm suporte parcial no navegador — se algum
deles não abrir corretamente no seu navegador, teste pelo **Expo Go** no
celular, onde o comportamento é nativo e 100% confiável.

## Observações

- O projeto usa **Expo SDK 51**. Caso o `npx expo start` peça para atualizar
  alguma dependência para casar com a versão do Expo instalada, aceite a
  atualização sugerida (`npx expo install --fix`).
- Todos os dados ficam salvos apenas no dispositivo do usuário (AsyncStorage);
  não há backend nem envio de dados para a internet.
