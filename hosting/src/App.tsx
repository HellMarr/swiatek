import { useEffect, useState } from 'react';
import bagelLogo from './assets/bagelLogo.png';
import './App.css';
import { getMatches, Match } from './utils/scraper';

function App() {
  const [matchList, setMatchList] = useState<Match[]>([]);
  const [bagelMatchList, setBagelMatchList] = useState<Match[]>([]);
  const [doubleBagelMatchList, setDoubleBagelMatchList] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Loading state

  useEffect(() => {
    const fetchMatches = async () => {
      const matches = await getMatches();

      const bagels = matches.filter(
        (match) => match.score.includes("6-0") || match.score.includes("0-6")
      );

      const doubleBagels = matches.filter(
        (match) => (match.score.match(/6-0/g) || []).length === 2
      );

      setMatchList(matches);
      setBagelMatchList(bagels);
      setDoubleBagelMatchList(doubleBagels);
      setLoading(false);
    };

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div><img src={bagelLogo} className="logo logo-spin" alt="Bagel logo" /></div>
    );
  }
  console.log(doubleBagelMatchList)

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <h1>Swiatek's Bakery</h1>
        <img src={bagelLogo} className="logo" alt="Bagel logo" />
      </div>
      <div>
        <h2>Last bagel</h2>
        <div className="card">
          {bagelMatchList[0].opponent.name} - {bagelMatchList[0].score}
        </div>
      </div>
      <div>
        <h2>Double bagels</h2>
        {doubleBagelMatchList.map((match, index) => (
          <div
            key={index}
          >
             {match.opponent.name} - {match.score}
          </div>
        ))}
      </div>
      <div>
        <h2>Bagels</h2>
        {bagelMatchList.map((match, index) => (
          <div
            key={index}
          >
             {match.opponent.name} - {match.score}
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
