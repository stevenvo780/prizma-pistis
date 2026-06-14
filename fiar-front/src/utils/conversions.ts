export function convertKeysToEnglish(obj: any) {
  const translationMap: any = {
    'Prefijo': 'prefix',
    'Telefono': 'phone',
    'UltimoContacto': 'lastContact',
    'Campaña': 'campaign',
    'Nota': 'note',
    'Etiqueta': 'label',
    'NombreEmpresa': 'companyName',
    'Nombre': 'firstName',
    'Apellido': 'lastName',
    'Titulo': 'title',
    'Dato1': 'data1',
    'Dato2': 'data2',
    'Dato3': 'data3'
  };

  let newObj: any = {};

  for (let key in obj) {
    let newKey: any = translationMap[key] || key;
    newObj[newKey] = obj[key].toString();
  }

  return newObj;
}

export function convertKeysToSpanish(obj: any) {
  const translationMap: any = {
    'prefix': 'Prefijo',
    'phone': 'Telefono',
    'lastContact': 'UltimoContacto',
    'campaign': 'Campaña',
    'note': 'Nota',
    'label': 'Etiqueta',
    'companyName': 'NombreEmpresa',
    'firstName': 'Nombre',
    'lastName': 'Apellido',
    'title': 'Titulo',
    'data1': 'Dato1',
    'data2': 'Dato2',
    'data3': 'Dato3'
  };

  let newObj: any = {};

  for (let key in obj) {
    let newKey: any = translationMap[key];
    if (newKey) {
      newObj[newKey] = obj[key];
    }
  }

  return newObj;
}
