import { useEffect, useState } from 'react';
import bagelLogo from './assets/bagelLogo.png';
import './App.css';
import { getMatches, Match } from './utils/scraper';

interface BagelStats {
  name: string;
  totalBagels: number;
  doubleBagels: number;
  singleBagels: number;
  matches: Match[];
}

type TabType = 'rankings' | 'double' | 'single' | 'iga';

function App() {
  const [bagelMatchList, setBagelMatchList] = useState<Match[]>([]);
  const [doubleBagelMatchList, setDoubleBagelMatchList] = useState<Match[]>([]);
  const [singleBagelMatchList, setSingleBagelMatchList] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [bagelRankings, setBagelRankings] = useState<BagelStats[]>([]);
  const [igaBagels, setIgaBagels] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('rankings');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      const matches = await getMatches();
      console.log(matches);

      const bagels = matches.filter(
        (match) => match.score.includes("6-0") || match.score.includes("0-6")
      );

      const doubleBagels = matches.filter(
        (match) => (match.score.match(/6-0/g) || []).length === 2
      );

      const singleBagels = bagels.filter(
        (match) => (match.score.match(/6-0/g) || []).length !== 2
      );

      // Find matches where Iga received a bagel
      const igaReceivedBagels = matches.filter(
        (match) => (match.result === "Loss" && match.score.includes("6-0")) || 
                   (match.result === "Victory" && match.score.includes("0-6"))
      );

      // Calculate bagel rankings
      const opponentStats = new Map<string, BagelStats>();
      
      bagels.forEach(match => {
        const opponentName = match.opponent.name;
        if (!opponentStats.has(opponentName)) {
          opponentStats.set(opponentName, {
            name: opponentName,
            totalBagels: 0,
            doubleBagels: 0,
            singleBagels: 0,
            matches: []
          });
        }
        
        const stats = opponentStats.get(opponentName)!;
        stats.matches.push(match);
        
        // Check if it's a double bagel
        if ((match.score.match(/6-0/g) || []).length === 2) {
          stats.doubleBagels += 1;
        } else {
          stats.singleBagels += 1;
        }
        stats.totalBagels = stats.doubleBagels * 2 + stats.singleBagels;
      });

      setBagelRankings(Array.from(opponentStats.values())
        .sort((a, b) => {
          // First sort by double bagels
          if (a.doubleBagels !== b.doubleBagels) {
            return b.doubleBagels - a.doubleBagels;
          }
          // If double bagels are equal, sort by single bagels
          return b.singleBagels - a.singleBagels;
        }));
      setIgaBagels(igaReceivedBagels);
      setBagelMatchList(bagels);
      setDoubleBagelMatchList(doubleBagels);
      setSingleBagelMatchList(singleBagels);
      setLoading(false);
    };

    fetchMatches();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filterMatches = (matches: Match[]) => {
    if (!searchQuery) return matches;
    
    const query = searchQuery.toLowerCase();
    return matches.filter(match => 
      match.tournament.toLowerCase().includes(query) ||
      match.round.toLowerCase().includes(query) ||
      match.opponent.name.toLowerCase().includes(query) ||
      match.courtType.toLowerCase().includes(query)
    );
  };

  const MatchCard = ({ match }: { match: Match }) => {
    const surfaceClass = match.courtType.toLowerCase();
    return (
      <div className={`match-card ${surfaceClass}`}>
        <div className={`surface-badge ${surfaceClass}`}>
          {match.courtType}
        </div>
        <div className="match-header">
          <h3 className="match-title">{match.tournament}</h3>
          <span className="match-date">{formatDate(match.date.toString())}</span>
        </div>
        
        <div className="match-details">
          <div className="match-info">
            <h4>Round</h4>
            <p>{match.round}</p>
          </div>
          <div className="match-info">
            <h4>Surface</h4>
            <p>{match.courtType}</p>
          </div>
          <div className="match-info">
            <h4>Result</h4>
            <p>{match.result}</p>
          </div>
        </div>

        <div className="score-display">
          {match.score}
        </div>

        <div className="opponent-stats">
          <div className="stat-item">
            <strong>{match.opponent.name}</strong>
          </div>
          <div className="stat-item">
            Rank: {match.opponent.rank}
          </div>
          <div className="stat-item">
            Nationality: {match.opponent.nationality}
          </div>
          <div className="stat-item">
            Height: {match.opponent.size}cm
          </div>
        </div>
      </div>
    );
  };

  const BagelRankings = () => (
    <div className="match-section">
      <h2>Bagel Rankings</h2>
      <div className="rankings-table">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Double Bagels</th>
              <th>Single Bagels</th>
              <th>Total Points</th>
            </tr>
          </thead>
          <tbody>
            {bagelRankings.map((player, index) => (
              <tr key={player.name}>
                <td>{index + 1}</td>
                <td>{player.name}</td>
                <td>{player.doubleBagels}</td>
                <td>{player.singleBagels}</td>
                <td>{player.totalBagels}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const SearchBar = () => (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder="Search by match details"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );

  const TabContent = () => {
    switch (activeTab) {
      case 'rankings':
        return <BagelRankings />;
      case 'double':
        return (
          <div className="match-section">
            <h2>Double Bagels</h2>
            {filterMatches(doubleBagelMatchList).length > 0 ? (
              filterMatches(doubleBagelMatchList).map((match, index) => (
                <MatchCard key={index} match={match} />
              ))
            ) : (
              <div className="no-results">
                No matches found matching your search criteria.
              </div>
            )}
          </div>
        );
      case 'single':
        return (
          <div className="match-section">
            <h2>Single Bagels</h2>
            {filterMatches(singleBagelMatchList).length > 0 ? (
              filterMatches(singleBagelMatchList).map((match, index) => (
                <MatchCard key={index} match={match} />
              ))
            ) : (
              <div className="no-results">
                No matches found matching your search criteria.
              </div>
            )}
          </div>
        );
      case 'iga':
        return (
          <div className="match-section">
            <h2>Iga's Bagels</h2>
            {filterMatches(igaBagels).length > 0 ? (
              filterMatches(igaBagels).map((match, index) => (
                <MatchCard key={index} match={match} />
              ))
            ) : (
              <div className="no-results">
                No matches found matching your search criteria.
              </div>
            )}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <img src={bagelLogo} className="logo logo-spin" alt="Bagel logo" />
      </div>
    );
  }

  return (
    <div className="bakery-container">
      <div className="bakery-header">
        <h1>Swiatek's Bakery</h1>
      </div>

      <div className="match-section">
        <h2>Latest Fresh Bagel</h2>
        {bagelMatchList[0] && <MatchCard match={bagelMatchList[0]} />}
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'rankings' ? 'active' : ''}`}
            onClick={() => setActiveTab('rankings')}
          >
            Rankings
          </button>
          <button 
            className={`tab ${activeTab === 'double' ? 'active' : ''}`}
            onClick={() => setActiveTab('double')}
          >
            Double Bagels
          </button>
          <button 
            className={`tab ${activeTab === 'single' ? 'active' : ''}`}
            onClick={() => setActiveTab('single')}
          >
            Single Bagels
          </button>
          <button 
            className={`tab ${activeTab === 'iga' ? 'active' : ''}`}
            onClick={() => setActiveTab('iga')}
          >
            Iga's Bagels
          </button>
        </div>
        {activeTab !== 'rankings' && <SearchBar />}
        <div className="tab-content active">
          <TabContent />
        </div>
      </div>
    </div>
  );
}

export default App;
