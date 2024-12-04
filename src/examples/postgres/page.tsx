import React from "react";
import { Base, Container, Text } from "@/components";

const useMemoAsync = <T,>(predicate: () => Promise<T>, deps) => {
    const [value, setValue] = React.useState(null as null | T);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(false);

    React.useEffect(() => {
        setLoading(true);
        predicate()
            .then(($) => setValue($))
            .catch((e) => setError(e))
            .then(() => setLoading(false))
    }, deps);

    return [value, loading, error] as const;
};

const useForceUpdate = ([value, setValue] = React.useState(false)) =>
    React.useCallback(() => setValue(!value), [value, setValue]);

const useTicker = (forceUpdate = useForceUpdate()) =>
    React.useMemo(() => ({ update: forceUpdate }), [forceUpdate]);

const api = {
    create: (text: string) => {
        return fetch(process.env.SELF_URL + '/api/v1/examples/postgres', { 
            method: 'POST', body: JSON.stringify({ text }), headers: { 'Content-Type': 'application/json' } 
        }).then((r) => r.json());
    },
    list: () => {
        return fetch(process.env.SELF_URL + '/api/v1/examples/postgres', { 
            method: 'GET', headers: { 'Content-Type': 'application/json' } 
        }).then((r) => r.json());
    },
    remove: (id: string) => {
        return fetch(process.env.SELF_URL + `/api/v1/examples/postgres/${id}`, { 
            method: 'DELETE', headers: { 'Content-Type': 'application/json' } 
        }).then((r) => r.json());
    },
};

export default () => {
    const ticker = useTicker();
    const [todos] = useMemoAsync(() => api.list(), [ticker]);

    const [text, setText] = React.useState('');

    const create = React.useCallback(() => {
        api.create(text)
            .then(ticker.update);
    }, [ticker, text]);

    const remove = React.useCallback((id) => {
        api.remove(id)
            .then(ticker.update);
    }, [ticker]);

    return (
        <Container>
            <Text>Postgres example (todos):</Text>

            <Base>
                {(todos || []).map((todo, index) => (
                    <Text mb="4px" key={todo.id}>· {todo.text} <span onClick={() => remove(todo.id)}>❌</span></Text>
                ))}
            </Base>

            <input value={text} onChange={(e) => setText(e.target.value)} />
            <button onClick={create}>Create</button>
        </Container>
    );
};
