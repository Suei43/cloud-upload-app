import { useState, useEffect } from 'react';
import serverUrl from '../config';

export default function Home() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:5187/api`)
            .then((res) => res.json())
            .then((data) => setData(data.message))
            .catch((err) => console.error(err));
    }, []);
    return (
        <>
            {data ? <h1>{data}</h1> : <h1>Loading...</h1>}
        </>
    )
}