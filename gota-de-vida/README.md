# Gota de Vida

Aplicativo mobile (React Native + Expo + TypeScript) que aproxima doadores de sangue e hemocentros do Rio Grande do Norte. MVP acadêmico com dados **fictícios** e autenticação **simulada**.

## Como executar

Requisitos: Node 20+ e o app **Expo Go** (SDK 53) no celular Android, ou um emulador.

```bash
npm install
npx expo install --check     # alinha versões nativas ao SDK, se necessário
npx expo start               # escaneie o QR code com o Expo Go
# atalhos: npm run android | npm run ios
npm run typecheck            # tsc --noEmit
```

## Contas de demonstração

| Perfil | E-mail | Senha |
|---|---|---|
| Doador | doador@demo.app | demo1234 |
| Funcionário do hemocentro | hemocentro@demo.app | demo1234 |

Na tela de login também há botões "Entrar como doador/funcionário". Para reiniciar os dados demonstrativos, limpe os dados do app (ou reinstale o Expo Go). A versão dos dados locais é `v2`; dados antigos são recriados automaticamente.

## Estrutura

```
app/                      rotas (Expo Router)
  index.tsx               tela institucional
  (auth)/                 login, cadastro
  doador/(tabs)/          Início, Campanhas, Doações, Notificações, Perfil
  doador/                 campanha/[id], hemocentros, agendamentos, exames
  hemocentro/(tabs)/      Painel, Campanhas, Agendamentos, Mais
  hemocentro/             campanha-form, necessidades, doadores, exames
src/
  components/             Button, Input, Chips, Card, Calendar, Screen, ModalSheet...
  contexts/               AuthContext
  data/                   dados fictícios (seed)
  services/               camada simulada (AsyncStorage) — trocar por API/Supabase
  utils/ theme/ types/ hooks/
```

## Jornada do doador (conforme o briefing)

- **Início:** jornada Descobrir → Agendar → Doar → Acompanhar → Resultados, dias desde a última doação (com aviso de que o intervalo é definido pelo serviço de hemoterapia) e hemocentro mais próximo pela cidade.
- **Conquistas e impacto** (`doador/conquistas`): Primeira doação, Doador recorrente, Apoiador de campanhas e Embaixador da doação. Contam só registros comprováveis; sem ranking nem incentivo a doar fora do intervalo orientado.
- **Carteira do doador** (`doador/carteira`): demonstrativa, não é documento oficial.
- **Campanhas coletivas:** campo "grupo organizador" no cadastro de campanhas; doador vê meta, participantes e % de progresso (ex.: Turma de SI, 24 de 30, 80%).
- **Relatórios básicos** (hemocentro, aba Mais): doações por unidade, campanhas coletivas, estoque em atenção e exames.

## Segurança e privacidade (importante)

- A autenticação é **simulada** e não oferece segurança real. Senhas não ficam em texto puro (hash simples apenas para demonstração; em produção use Supabase Auth).
- Os guards de rota por perfil são só de interface; a autorização real deve ser feita no servidor.
- Dados de exames são fictícios; o app não faz diagnóstico nem interpretação clínica. Notificações não contêm dados de saúde e o canal Android usa visibilidade privada na tela de bloqueio.
- Hemocentros, endereços e contatos são fictícios e identificados como "demonstrativo".

## Preparado para evoluir

- `src/services/*`: substituir pelas chamadas reais (Supabase/API) mantendo as assinaturas.
- `expo-location` e `react-native-maps` já estão instalados: `locationService.ts` ordena por distância e abre o mapa do aparelho; um `MapView` pode ser adicionado depois.
- `expo-notifications`: estrutura e lembrete local em `notificationService.ts`. Push remoto não funciona no Expo Go (SDK 53); exige development build.
