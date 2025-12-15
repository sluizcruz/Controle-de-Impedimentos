# 🛠️ Guia de Configuração: Firebase e GitHub

Este guia descreve o passo a passo para configurar o ambiente de nuvem (Firebase) e a integração contínua (GitHub Actions) para que o **Controle de Impedimentos** funcione corretamente.

---

## 1. Configuração do Firebase 🔥

O Firebase é responsável pela hospedagem, banco de dados e autenticação.

### 1.1 Criar o Projeto
1. Acesse o [Console do Firebase](https://console.firebase.google.com/).
2. Clique em **"Adicionar projeto"**.
3. Nomeie o projeto (ex.: `controle-de-impedimentos-seu-nome`).
4. Desative o Google Analytics (não é necessário para este projeto) e clique em **Criar projeto**.

### 1.2 Configurar Autenticação (Login)
1. No menu lateral esquerdo, clique em **Criação > Authentication**.
2. Clique em **Vamos começar**.
3. Na aba **Sign-in method**, selecione **Google**.
4. Clique em **Ativar**.
5. Preencha o "Nome do projeto" e selecione seu "E-mail de suporte".
6. Clique em **Salvar**.
7. **Importante:** Ainda em Authentication, vá na aba **Configurações (Settings)** > **Domínios autorizados**.
   - Adicione o domínio da sua aplicação (ex.: `controle-de-impedimentos.web.app`) e `localhost` se for testar localmente.

### 1.3 Criar Banco de Dados (Firestore)
1. No menu lateral, clique em **Criação > Firestore Database**.
2. Clique em **Criar banco de dados**.
3. Escolha a localização (recomendado: `southamerica-east1` para Brasil, ou `us-central1`).
4. Escolha **Iniciar no modo de produção**.
5. Clique em **Criar**.
6. Vá na aba **Regras** e cole a regra temporária abaixo (permite leitura/escrita para usuários logados):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
7. Clique em **Publicar**.

### 1.4 Obter Credenciais Web
1. No menu lateral, clique no ícone de engrenagem ⚙️ > **Configurações do projeto**.
2. Role até a seção "Seus aplicativos" e clique no ícone **Web (</>)**.
3. Registre o app (ex.: `Web App`). Ative a opção **Firebase Hosting** se desejar, mas vamos configurar isso via GitHub depois.
4. Após registrar, você verá um objeto `firebaseConfig`. **COPIE ESSES DADOS**, você precisará deles.

---

## 2. Atualizar o Código 📝

Agora você precisa conectar o código ao seu novo projeto Firebase.

1. Abra o arquivo `src/constants/index.ts` no seu editor.
2. Procure a constante `FIREBASE_CONFIG`.
3. Substitua os valores pelos que você copiou do Firebase no passo 1.4.

Exemplo:
```typescript
export const FIREBASE_CONFIG = {
    apiKey: "AIzaSy...", // Sua nova API Key
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.firebasestorage.app",
    messagingSenderId: "123456...",
    appId: "1:123456...",
}
```

4. No mesmo arquivo, certifique-se de que `ALLOWED_DOMAIN` está correto para sua organização (padrão atual: `'rethink.dev'`).

---

## 3. Configurar GitHub Actions (Deploy Automático) 🚀

Para que o site seja publicado automaticamente quando você atualizar o código.

### 3.1 Gerar Token de Serviço (Service Account)
1. No Console do Firebase > **Configurações do projeto**.
2. Vá na aba **Contas de serviço**.
3. Clique em **Gerar nova chave privada**.
4. Um arquivo JSON será baixado. **Abra este arquivo e copie todo o conteúdo**.

### 3.2 Configurar Secret no GitHub
1. Vá para o seu repositório no GitHub.
2. Clique em **Settings** (Configurações).
3. No menu lateral, expanda **Secrets and variables** e clique em **Actions**.
4. Clique em **New repository secret**.
5. **Name**: `FIREBASE_SERVICE_ACCOUNT`
6. **Secret**: Cole o conteúdo do JSON que você copiou.
7. Clique em **Add secret**.

---

## 4. Finalizar Deploy 🏁

1. Faça o commit e push das alterações (especialmente a atualização do `src/constants/index.ts` com suas chaves novas).
   ```bash
   git add .
   git commit -m "config: atualiza credenciais do firebase"
   git push
   ```

2. Vá na aba **Actions** do GitHub. Você verá o workflow `Deploy Firebase` rodando.
3. Se tudo der certo (ícone verde ✅), seu site estará no ar!
4. O link geralmente é `https://<seu-project-id>.web.app`.

---

## 5. Solução de Problemas Comuns

- **Erro de Login "auth/operation-not-allowed"**: Você esqueceu de ativar o provedor Google no Authentication.
- **Erro de Login "auth/unauthorized-domain"**: O domínio do site não está na lista de "Domínios autorizados" no Firebase Auth.
- **Tela Branca / Erro 404**: Verifique se as regras do Firestore permitem leitura.
- **Deploy Falhou**: Verifique se o nome da secret no GitHub é exatamente `FIREBASE_SERVICE_ACCOUNT`.
