import React from "react";

export type UserPayload = {
    user_id: number,
    username: string,
    role: 'user' | 'admin',
    valid: boolean,
    loaded: boolean
}

export const UserPayloadContext = React.createContext<UserPayload>({
    user_id: 0,
    username: '',
    valid: false,
    loaded: false,
    role: "user"
});