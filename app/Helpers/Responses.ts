import { ResponseContract } from '@ioc:Adonis/Core/Response'

interface ResParams {
  response: ResponseContract
  message: string
  data?: any
}

interface ResParamsError {
  response: ResponseContract
  message: string
  data?: any
  error?: any
}

export const successfulResponse = ({ response, message, data }: ResParams) => {
  return response.status(200).json({
    status: true,
    message,
    data,
  })
}

export const createdResponse = ({ response, message, data }: ResParams) => {
  return response.status(201).json({
    status: true,
    message,
    data,
  })
}

export const deletedResponse = ({ response, message, data }: ResParams) => {
  return response.status(200).json({
    status: true,
    message,
    data,
  })
}

export const conflictResponse = ({ response, message, data }: ResParams) => {
  return response.status(409).json({
    status: false,
    message,
    data,
  })
}

export const unauthorizedResponse = ({ response, message, data }: ResParams) => {
  return response.status(401).json({
    status: false,
    message,
    data,
  })
}

export const notFoundResponse = ({ response, message, data }: ResParams) => {
  return response.status(404).json({
    status: false,
    message,
    data,
  })
}

export const badRequestResponse = ({ response, message, data, error }: ResParamsError) => {
  return response.status(400).json({
    status: false,
    message,
    data,
    error,
  })
}
