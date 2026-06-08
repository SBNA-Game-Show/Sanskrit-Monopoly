//for testing with no server functionality implemented

//fake game object
//import this into wherever file it's needed in
import boatImg from "../assets/monopoly_boat.png";
import shoeImg from "../assets/monopoly_shoe.png";
import catImg from "../assets/monopoly_cat.png";
import dogImg from "../assets/monopoly_dog.png";


export const LOBBY_STATE: FakeLobbyState = {
    lobbyCode: '4C1OR4',
    status: 'waiting',
    players: [
        {
            uid: 'BRbd5xVuhOfWDhznkrt9ALNvzt63',
            username: 'Player 1',
            socketId: `tempsocketid`,
            points: 700,
            // Temporary
            // properties and money might be removed or readded in later
            properties: ['street 1', 'street 2'],
            money: 300,
            token: boatImg,
        },
        {
            uid: 'BRbd5xVuhOfWDhznkrt9ALNvzt64',
            username: 'Player 2',
            socketId: `tempsocketid`,
            points: 200,
            // Temporary
            // properties and money might be removed or readded in later
            properties: ['street 3'],
            money: 500,
            token: shoeImg,
        },
        {
            uid: 'BRbd5xVuhOfWDhznkrt9ALNvzt65',
            username: 'Player 3',
            socketId: `tempsocketid`,
            points: 1000,
            // Temporary
            // properties and money might be removed or readded in later
            properties: ['street 4', 'street 5', 'street 6'],
            money: 400,
            token: catImg,
        },
        {
            uid: 'BRbd5xVuhOfWDhznkrt9ALNvzt66',
            username: 'Player 4',
            socketId: `tempsocketid`,
            points: 800,
            // Temporary
            // properties and money might be removed or readded in later
            properties: ['street 7'],
            money: 100,
            token: dogImg,
        }
    ],
    host: {
        uid: 'BRbd5xVuhOfWDhznkrt9ALNvzt62',
        username: 'host',
        socketId: `tempsocketid`
    }
}

export type FakeLobbyState = {
    lobbyCode: string;
    status: string;
    players: FakePlayer[];
    host: {
        uid: string;
        username: string;
        socketId: string;
    };
}

export type FakePlayer = {
    uid: string;
    username: string;
    socketId: string;
    points: number;
    // Temporary
    // properties and money might be removed or readded in later
    properties: string[];
    money: number;
    token: string;
};