# 💰 Money Nerd

**Money Nerd** é um sistema completo de **gerenciamento financeiro pessoal** que permite o controle de transações, categorias, contas e usuários.  
O projeto conta com **sistema de autenticação avançado**, incluindo login via Google e GitHub, redefinição de senha e proteção de dados.

> 🚀 Criado com foco em portfólio, mas escalável para um dia ser usado em produção.
> ⚠️ **Código aberto apenas para consulta e uso não comercial.**

---

## ✨ Funcionalidades

- **Gerenciamento de Transações**

  - Cadastro, edição e exclusão de receitas e despesas.
  - Dashboard com gráficos de wealth growth, gastos por categorias e Incomes x Expenses
  - Filtro por datas, categorias e contas.
  - Possibilidade de cadastro de multiplas transações via .PDF e .CSV de bancos específicos, extração de dados feita via REGEX.

- **Categorias e Contas**

  - Organização personalizada para controle financeiro.
  - Saldo consolidado por conta.

- **Sistema de Autenticação**

  - Registro de novos usuários.
  - Login com email/senha.
  - Login social via **Google** e **GitHub**.
  - Recuperação e redefinição de senha.

- **Segurança**
  - Proteção de rotas com autenticação JWT.
  - Armazenamento seguro de senhas (hash).

---

## 🛠️ Tecnologias Utilizadas

**Frontend**

- Angular
- CSS Modules
- Materials

**Backend**

- NestJS
- MongoDB / Mongoose
- JWT para autenticação

**Integrações**

- Google OAuth
- GitHub OAuth

---

## 🚀 Como Executar Localmente

Backend:

Você vai precisar configurar seu environment, ter mongodb e mongoose configurados, e node na versão adequada. (22.12 recomendado)

# Instalar dependências

npm install

# Rodar aplicação

npm start run:dev

Frontend:

# Instalar dependências

npm install

# Rodar aplicação

npm start

```

📜 Licença e Uso
Este projeto está sob a Licença Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0).

Você pode:

Clonar, estudar e executar o código para fins pessoais e de aprendizado.

Referenciar este repositório em portfólios e trabalhos acadêmicos.

Você NÃO PODE:

Usar este código para fins comerciais.

Distribuir versões modificadas para fins comerciais.

Remover os créditos e direitos autorais.
```
