import { MentorAPIClient } from "./mentorAPIClient";
import { MentorRequest, MentorResponse } from "./mentorModels";


export class MentorService {

    private mentorAPIClient: MentorAPIClient;

    constructor(mentorAPIClient: MentorAPIClient) {
        this.mentorAPIClient = mentorAPIClient;
    }

    async askMentor(message: string, model: string): Promise<string> {
        const request: MentorRequest = {
            query: message,
            model: model
        };
        const response: MentorResponse = await this.mentorAPIClient.askMentor(request);
        return response.response;
    }

    async giveHint(message: string, model: string): Promise<string> {
        const request: MentorRequest = {
            query: message,
            model: model
        };
        const response: MentorResponse = await this.mentorAPIClient.giveHint(request);
        return response.response;
    }

    async explainCode(message: string, model: string): Promise<string> {
        const request: MentorRequest = {
            query: message,
            model: model
        };
        const response: MentorResponse = await this.mentorAPIClient.explainCode(request);
        return response.response;
    }
}
