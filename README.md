## running:

```sh
npm install
npm start
```

Will start the API on `http://localhost:5000`

## creating mocks:

Create new mocks by sending POST /create-mock requests with `url`, `method`, and `response`

e.g.:

```
POST /create-mock
{
    "url": "/test-endpoint",
    "method": "GET",
    "response": "{ \"test\": \"value1\" }"
}
```

Then you can retrieve it using:

```
GET /test-endpoint
```

The data is stored in `./data/data.json` and can be modified/deleted as needed
