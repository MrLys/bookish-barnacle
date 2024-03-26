export type Message = {
    role: string,
    content: string
}
export type config = {
    OPENAI_API_KEY : string,
    ANTROPIC_API_KEY : string
}
export type AntropicModel = {
    name: string,
    description: string,
    stengths: string
}
export type AntropicModels = {
    model : Array<AntropicModel>
}
