export const uschedule_ms = {
  provider: 'microsoft',
  name: { familyName: '', givenName: '' },
  id: '16a56646d65c468e',
  displayName: '',
  emails: [{ type: 'work', value: null }],
  _raw: '{"@odata.context":"https://graph.microsoft.com/v1.0/$metadata#users/$entity","displayName":"","surname":"","givenName":"","id":"16a56646d65c468e","userPrincipalName":"email@uschedule.me","businessPhones":[],"jobTitle":null,"mail":null,"mobilePhone":null,"officeLocation":null,"preferredLanguage":null}',
  _json: {
    '@odata.context': 'https://graph.microsoft.com/v1.0/$metadata#users/$entity',
    displayName: '',
    surname: '',
    givenName: '',
    id: '16a56646d65c468e',
    userPrincipalName: 'email@uschedule.me',
    businessPhones: [],
    jobTitle: null,
    mail: null,
    mobilePhone: null,
    officeLocation: null,
    preferredLanguage: null,
  },
};

export const hotmail_ms = {
  provider: 'microsoft',
  name: { familyName: 'Smith', givenName: 'John' },
  id: '16a5f646d45c408e',
  displayName: 'John Smith',
  emails: [{ type: 'work', value: null }],
  _raw: '{"@odata.context":"https://graph.microsoft.com/v1.0/$metadata#users/$entity","displayName":"John Smith","surname":"Smith","givenName":"John","id":"16a5f646d45c408e","userPrincipalName":"email@hotmail.com","businessPhones":[],"jobTitle":null,"mail":null,"mobilePhone":null,"officeLocation":null,"preferredLanguage":null}',
  _json: {
    '@odata.context': 'https://graph.microsoft.com/v1.0/$metadata#users/$entity',
    displayName: 'John Smith',
    surname: 'Smith',
    givenName: 'John',
    id: '16a5f646d45c408e',
    userPrincipalName: 'email@hotmail.com',
    businessPhones: [],
    jobTitle: null,
    mail: null,
    mobilePhone: null,
    officeLocation: null,
    preferredLanguage: null,
  },
};

export const uottawa_ms = {
  provider: 'microsoft',
  name: { familyName: 'Smith', givenName: 'Peter' },
  id: '1a5f5c4e-5ebf-48d6-a4cd-250d6afec4e5',
  displayName: 'John Smith',
  emails: [{ type: 'work', value: 'stude012@uottawa.ca' }],
  _raw: '{"@odata.context":"https://graph.microsoft.com/v1.0/$metadata#users/$entity","businessPhones":[],"displayName":"John Smith","givenName":"Peter","jobTitle":null,"mail":"stude012@uottawa.ca","mobilePhone":null,"officeLocation":null,"preferredLanguage":null,"surname":"Smith","userPrincipalName":"stude012@uottawa.ca","id":"1a5f5c4e-5ebf-48d6-a4cd-250d6afec4e5"}',
  _json: {
    '@odata.context': 'https://graph.microsoft.com/v1.0/$metadata#users/$entity',
    businessPhones: [],
    displayName: 'John Smith',
    givenName: 'Peter',
    jobTitle: null,
    mail: 'stude012@uottawa.ca',
    mobilePhone: null,
    officeLocation: null,
    preferredLanguage: null,
    surname: 'Smith',
    userPrincipalName: 'stude012@uottawa.ca',
    id: '1a5f5c4e-5ebf-48d6-a4cd-250d6afec4e5',
  },
};

export const facebook = {
  id: '12345678901234567',
  username: undefined,
  displayName: undefined,
  name: { familyName: 'Smith', givenName: 'John', middleName: undefined },
  gender: undefined,
  profileUrl: undefined,
  emails: [{ value: 'email@address.com' }],
  provider: 'facebook',
  _raw: '{"id":"12345678901234567","email":"email\\u0040address.com","last_name":"Smith","first_name":"John"}',
  _json: {
    id: '12345678901234567',
    email: 'email@address.com',
    last_name: 'Smith',
    first_name: 'John',
  },
};

export const google_personal = {
  id: '123456789012345678901',
  displayName: 'John Smith',
  name: { familyName: 'Smith', givenName: 'John' },
  emails: [{ value: 'email@address.com', verified: true }],
  photos: [
    {
      value:
        'https://lh6.googleusercontent.com/-bMSQCs84kkI/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclrn4XIn-AG97b24wzDla7i79Hskw/s96-c/photo.jpg',
    },
  ],
  provider: 'google',
  _raw:
    '{\n' +
    '  "sub": "123456789012345678901",\n' +
    '  "name": "John Smith",\n' +
    '  "given_name": "John",\n' +
    '  "family_name": "Smith",\n' +
    '  "picture": "https://lh6.googleusercontent.com/-bMSQCs84kkI/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclrn4XIn-AG97b24wzDla7i79Hskw/s96-c/photo.jpg",\n' +
    '  "email": "email@address.com",\n' +
    '  "email_verified": true,\n' +
    '  "locale": "en-GB"\n' +
    '}',
  _json: {
    sub: '123456789012345678901',
    name: 'John Smith',
    given_name: 'John',
    family_name: 'Smith',
    picture:
      'https://lh6.googleusercontent.com/-bMSQCs84kkI/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclrn4XIn-AG97b24wzDla7i79Hskw/s96-c/photo.jpg',
    email: 'email@address.com',
    email_verified: true,
    locale: 'en-GB',
  },
};
