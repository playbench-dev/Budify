import * as React from 'react';

export function Select(url, formBody) {
    let json = fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        mode: 'cors',
        cache: 'default',
        body: formBody,
    }).then(
        response => response.json()
    )
    return json
}