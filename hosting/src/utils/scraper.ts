import axios from "axios";

const URL = "https://swiatek-scraping.martinouais.workers.dev/";

export async function getMatches() {
    try {
        // Fetch the JavaScript file
        const { data } = await axios.get(URL);

        // Clean up the fetched data by removing unnecessary spaces and newlines
        const cleanedData = data.replace(/\s+/g, '').trim(); // remove excessive whitespace

        // Log the cleaned-up data to inspect it
        console.log("Cleaned data:", cleanedData); // log first 1000 characters for inspection

        // Improved regex to capture the entire array, allowing for trailing spaces or other issues
        const matchRegex = /varmorematchmx=*(\[\[.*?\]\]);/s;
        const matchRegex2 = /varmatchmx=*(\[\[.*?\]\]);/s;

        // Try to find the array using the regex
        const match = matchRegex.exec(cleanedData);
        const firstmatches = matchRegex2.exec(cleanedData);
        if (match && firstmatches) {
            console.log("Match found for morematchmx!");

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

            // Log the sorted matches
            console.log("Sorted matches by date:", sortedMatches);

        } else {
            console.log("No match found for morematchmx.");
        }
    } catch (error) {
        console.error("Error fetching or parsing the matches:", error);
    }
}
