import fetch from 'node-fetch';

// Por ahora devolvemos respuesta directa (sin dependencia de API externas)
export async function askSandraNatural(text) {
  // TODO: sustituir por tu endpoint real de Sandra cuando lo tengas:
  // const r = await fetch(process.env.SANDRA_API_URL, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.SANDRA_API_KEY}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({ text })
  // });
  // const { reply } = await r.json();
  // return reply;

  // Placeholder natural:
  return `Entendido: ${text}. Soy Sandra y estoy lista para ayudarte con tu estancia en Guests Valencia.`;
}
