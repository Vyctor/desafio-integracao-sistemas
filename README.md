# Desafio Integração de Sistemas

O desafio consiste em atentder uma demanda de integração entre dois sistemas. O primeiro sistema é um legado que possui um arquivo de pedidos desnormalizado, precisamos transformá-lo em um arquivo json normalizado. Para isso, precisamos receber esse arquivo em um endpoint rest, normaliza-lo e disponibiliza-lo em outro endpoint rest.

## Decisões técnicas

Optei por um banco relacional pela maior facilidade de modelagem e consulta de dados, visto que temos podemos abstrair três entidades do arquivo desnormalizado de pedidos: Customers, Orders e OrderProducts. Sendo assim busquei uma solução que fosse mais simples e rápida para a resolução do problema, e que me permitisse focar também na rapidez para retorno desses dados via API, uma vez que estruturando os dados em tabelas, a consulta se torna mais rápida, eficience e menos custosa.

Para a importação dos pedidos optei por utilizar o multer para lidar com o upload do arquivo, após isso transformei o arquivo em um objeto json ainda desnormalizado (como no arquivo original). Feito isso deleguei ao usecase **ImportOrdersFromFile** a responsabilidade de transformar o arquivo em um objetos do tipo Customer, Order e OrderProducts e persisti-los no banco de dados.

### Principais Tecnologias

- **Node.js**: Plataforma de execução de código JavaScript no servidor.
- **Nest.js**: Framework web utilizado para criar a API RESTful.
- **Typescript**: Superconjunto de JavaScript que adiciona tipagem estática opcional.
- **Docker**: Ferramenta de containerização usada para criar, distribuir e executar o projeto de forma isolada.
- **PostgreSQL**: Sistema gerenciador de banco de dados relacional utilizado para armazenar os dados da aplicação.

## Executando o projeto

### Requisitos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Passos até a execução

Execute o comando abaixo para executar o projeto localmente. O comando irá instalar as dependências e iniciar o servidor na porta 3000, assim como o banco de dados na porta 5432.

```bash
`docker-compose up --build`
```

## Utilizando o projeto

Para utilizar o projeto pode-se realizar chamadas HTTP utilizando o [Postman](./utils/postman/desafio.postman.json) ou qualquer outra ferramenta de sua preferência. Caso prefira também é possível realizar chamadas via Swagger, acessando o endpoint `http://localhost:3000/swagger`.

### Importando o arquivo de pedidos

Para importar o arquivo de pedidos, é necessário realizar uma requisição POST para o endpoint `http://localhost:3000/orders/import` enviando o arquivo no corpo da requisição com a chave `file`. O arquivo deve ser enviado no formato `multipart/form-data`. O arquivo de exemplo pode ser encontrado na pasta [utils](./utils/payloads/) do projeto.

## Documentação da API

É possível acessar a documentação da API através do endpoint `http://localhost:3000/swagger`, que possui as rotas e os parâmetros de entrada e saída da aplicação.
