# SISA - Arquitetura e Documentação do Sistema

## 1. Estrutura do Projeto (Frontend & Backend)

O sistema segue uma arquitetura **Full-Stack** moderna, utilizando **React** no frontend e **Node.js (Express)** no backend, com uma estrutura modular para facilitar a escalabilidade.

```text
/sisa-erp
├── /src                # Frontend (React + TypeScript)
│   ├── /components     # Componentes modulares (UI e Negócio)
│   ├── /hooks          # Hooks customizados para lógica de estado
│   ├── /services       # Integração com API (Axios/Fetch)
│   ├── /lib            # Utilitários e configurações (Tailwind, etc)
│   ├── /types          # Definições de interfaces TypeScript
│   └── App.tsx         # Orquestrador de rotas e estado global
├── /server             # Backend (Node.js + Express)
│   ├── /controllers    # Lógica de controle das rotas
│   ├── /models         # Definições de esquemas (PostgreSQL/Prisma)
│   ├── /routes         # Definição de endpoints REST
│   ├── /middlewares    # Autenticação (JWT) e RBAC
│   └── index.ts        # Ponto de entrada do servidor
├── /docs               # Documentação técnica
├── package.json        # Dependências e scripts
└── tailwind.config.js  # Configuração visual
```

## 2. Modelagem do Banco de Dados (Relacional - PostgreSQL)

Utilizamos um banco relacional para garantir a integridade dos dados clínicos (ACID).

### Tabelas Principais:
- **Users**: `id, name, email, password_hash, role (admin, doctor, nurse, reception), hospital_id`
- **Patients**: `id, full_name, bi_number, birth_date, gender, contact, address, blood_type`
- **Appointments**: `id, patient_id, doctor_id, date_time, status (scheduled, completed, cancelled), type`
- **MedicalRecords**: `id, patient_id, doctor_id, diagnosis, prescription, symptoms, date`
- **Inventory**: `id, item_name, category, quantity, min_stock, expiry_date, hospital_id`
- **Exams**: `id, patient_id, type, status (pending, ready), result_url, date`

## 3. Exemplos de Endpoints da API (RESTful)

### Autenticação
- `POST /api/auth/login`: Autentica usuário e retorna JWT.
- `GET /api/auth/me`: Retorna dados do usuário logado.

### Pacientes
- `GET /api/patients`: Lista pacientes com filtros (nome, BI).
- `POST /api/patients`: Cadastra novo paciente.
- `GET /api/patients/:id/history`: Retorna prontuário completo.

### Agendamento
- `GET /api/appointments`: Lista agenda do dia/médico.
- `POST /api/appointments`: Cria novo agendamento.

### Farmácia
- `GET /api/inventory/alerts`: Retorna itens abaixo do stock mínimo.
- `PATCH /api/inventory/:id/stock`: Atualiza quantidade (entrada/saída).

## 4. Boas Práticas de Segurança e Performance

### Segurança:
1. **RBAC (Role-Based Access Control)**: Middlewares que verificam se o usuário tem permissão para acessar a rota (ex: apenas médicos acessam prontuários).
2. **Criptografia**: Senhas armazenadas com `bcrypt`. Dados sensíveis em trânsito via `HTTPS`.
3. **Sanitização**: Proteção contra SQL Injection e XSS via bibliotecas de validação (ex: `zod`).

### Performance:
1. **Caching**: Uso de `React Query` no frontend para evitar requisições duplicadas.
2. **Offline-First**: Sincronização em background para áreas com internet instável.
3. **Lazy Loading**: Carregamento modular de componentes para reduzir o bundle inicial.

## 5. Fluxo de Integração
Os módulos comunicam-se em tempo real. Quando um paciente é triado (Módulo Triagem), ele aparece automaticamente na lista de espera do médico (Módulo Atendimento). Se o médico prescreve um medicamento, o stock é reservado no Módulo Farmácia.
