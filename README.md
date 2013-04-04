#Something Witty Contacts API Overview

The API currently has a single endpoing `/contacts` with no authentication. It supports the basic rest actions of `GET`, `POST`, `PUT`, and `DELETE`.

The `PUT` and `POST` methods expect JSON with the following structure in the body.

```json
{
	"id":"37c3d4aexee74x471exb0a5xf7c26771f1ec", 
	"name":"Contact Name",
	"title":"Title"
	"emails":["new@example.com","raytiley@gmail.com"],
	"phones":["111-111-111","222.222.222"],
	"default_call_phone":"207-518-8612",
	"default_email":"raytiley@gmail.com",
	"default_txt_phone":"207-518-8612",
}
```

The API only works with JSON so be sure to set the following HTTP Headers

`Accept: application/json`
`Content-Type: application/json`
