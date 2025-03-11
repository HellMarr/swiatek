export async function getFlagUrl(alpha3: string): Promise<string> {
  try {
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${alpha3}`);
    const data = await response.json();
    const alpha2 = data[0]?.cca2; // Extract ISO 3166-1 alpha-2 code

    return alpha2 ? `https://flagcdn.com/w320/${alpha2.toLowerCase()}.png` : "";
  } catch (error) {
    console.error(`Error fetching flag for ${alpha3}:`, error);
    return "";
  }
}