import React from "react";

export type UserPayload = {
    user_id: number,
    username: string
}

export const UserPayloadContext = React.createContext<UserPayload>({
    user_id: 0,
    username: ''
});