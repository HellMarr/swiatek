import axios from "axios";
import { getFlagUrl } from "./fetcher";

const URL = "https://swiatek-scraping.martinouais.workers.dev/";

export interface Opponent {
  name: string,
  birthDate: Date,
  size: string,
  nationality: string,
  rank: number,
  flag: string,
}

export interface Match {
  date: Date,
  tournament: string,
  courtType: string,
  round: string,
  result: 'Victory' | 'Loss'
  score: string,
  opponent: Opponent,

}

export async function getMatches() {
  let matchList: Match[] = [];
  try {
        // Fetch the JavaScript file
        const { data } = await axios.get(URL);
        const cleanedData = data.replace(/ {2,}/g, "");
        const matchRegex = /var\smorematchmx\s*=\s*(\[.*?\]);/s;
        const matchRegex2 = /var\smatchmx\s*=\s*(\[.*?\]);/s;
        const match = matchRegex.exec(cleanedData);
        const firstmatches = matchRegex2.exec(cleanedData);    
        if (match && firstmatches) {

            // Extract the matches and clean up any residual spaces or unexpected characters
            let matchesString = match[1].trim();
            let matchesString2 = firstmatches[1].trim();
            // Parse the cleaned string into an actual array
            const matchesArray = JSON.parse(matchesString);
            const matchesArray2 = JSON.parse(matchesString2);
            // Merge both arrays
            const allMatches = [...matchesArray2, ...matchesArray];

            // Format and sort the array by date in descending order
            const sortedMatches = allMatches
                .map((matchDetails: any) => {
                    // Format the first column (date) into a Date object
                    matchDetails[0] = new Date(matchDetails[0].substring(0, 4), matchDetails[0].substring(4, 6) - 1, matchDetails[0].substring(6, 8));
                    return matchDetails;
                })
                .sort((a, b) => b[0] - a[0]); // Sort by date in descending order
            
            matchList = await Promise.all(
              sortedMatches.map(async (match) => {
                const opponentBirthDate = new Date(
                  match[16].substring(0, 4),
                  match[16].substring(4, 6) - 1,
                  match[16].substring(6, 8)
                );
      
                const opponent: Opponent = {
                  name: match[11],
                  birthDate: opponentBirthDate,
                  size: match[17],
                  nationality: match[18],
                  flag: await getFlagUrl(match[18]), // Attente du flag ici
                  rank: parseInt(match[12]),
                };
      
                return {
                  date: match[0],
                  tournament: match[1],
                  courtType: match[2],
                  round: match[8],
                  result: match[4] === "W" ? "Victory" : "Loss",
                  score: match[9],
                  opponent,
                };
              })
            );
        } else {
            console.log("No match found for morematchmx.");
        }
        return matchList
    } catch (error) {
        return matchList
        console.error("Error fetching or parsing the matches:", error);
    }
}
