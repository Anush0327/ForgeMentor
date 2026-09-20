import { MentorResponse } from "./mentorModels";
import { MentorRequest } from "./mentorModels";
import * as vscode from "vscode";

export class MentorAPIClient {
    private readonly baseUrl: string;

    constructor() {
        this.baseUrl = vscode.workspace
            .getConfiguration("forgeMentor")
            .get<string>("backendUrl", "http://forgementor.local");
    }

    private async _request(endpoint: string, request: MentorRequest): Promise<MentorResponse> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error('Failed to get response from mentor');
        }

        const data = await response.json() as MentorResponse;
        return data;
    }

    public async askMentor(request: MentorRequest): Promise<MentorResponse> {
        return this._request("/api/ask-mentor", request);
    }

    public async giveHint(request: MentorRequest): Promise<MentorResponse> {
        return this._request("/api/give-hint", request);
    }

    public async explainCode(request: MentorRequest): Promise<MentorResponse> {
        return this._request("/api/explain-code", request);
    }
}