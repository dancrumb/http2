import { xstate } from "./.vscode/deps.ts";

const machine = xstate.createMachine(
  {
    id: "HTTP2 Stream",
    initial: "Idle",
    states: {
      Idle: {
        on: {
          "recv PP": {
            target: "Reserved (Remote)",
          },
          "send PP": {
            target: "Reserved (Local)",
          },
          "send H": {
            target: "Open",
          },
          "recv H": {
            target: "Open",
          },
        },
      },
      "Reserved (Remote)": {
        on: {
          "send R": {
            target: "Closed",
          },
          "recv H": {
            target: "Half Closed (Local)",
          },
          "recv R": {
            target: "Closed",
          },
        },
      },
      "Reserved (Local)": {
        on: {
          "send R": {
            target: "Closed",
          },
          "recv R": {
            target: "Closed",
          },
          "send H": {
            target: "Half Closed (Remote)",
          },
        },
      },
      Open: {
        on: {
          "recv ES": {
            target: "Half Closed (Remote)",
          },
          "send ES": {
            target: "Half Closed (Local)",
          },
          "send R": {
            target: "Closed",
          },
          "recv R": {
            target: "Closed",
          },
        },
      },
      Closed: {
        type: "final",
      },
      "Half Closed (Local)": {
        on: {
          "recv ES": {
            target: "Closed",
          },
          "send R": {
            target: "Closed",
          },
          "recv R": {
            target: "Closed",
          },
        },
      },
      "Half Closed (Remote)": {
        on: {
          "send R": {
            target: "Closed",
          },
          "recv R": {
            target: "Closed",
          },
          "send ES": {
            target: "Closed",
          },
        },
      },
    },
    predictableActionArguments: true,
    preserveActionOrder: true,
  },
  {
    actions: {},
    services: {},
    guards: {},
    delays: {},
  }
);

export const getStreamState = () => xstate.interpret(machine);
