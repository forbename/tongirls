import { CHAIN } from "@tonconnect/protocol";
import { Sender, SenderArguments } from "ton-core";
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { beginCell } from '@ton/ton'

export function useTonConnect(): {
  sender: Sender;
  connected: boolean;
  wallet: string | null;
  network: CHAIN | null;
  // number: number | 0;
} {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  console.log("wallet",wallet)
  console.log("tonConnectUI",tonConnectUI)

  const queryParams = getQueryParams();
  console.log("queryParams",queryParams)
  var chatid = queryParams.chatid?queryParams.chatid : '';
  console.log("chatid",chatid)
  const body = beginCell()
      .storeUint(0, 32) // write 32 zero bits to indicate that a text comment will follow
      .storeStringTail("Recharge#"+chatid) // write our text comment
      .endCell();

  function getQueryParams(): Record<string, string> {
    const params = new URLSearchParams(window.location.search);
    const result: Record<string, string> = {};

    for (const [key, value] of params.entries()) {
      result[key] = value;
    }

    return result;
  }




  return {
    sender: {
      send: async (args: SenderArguments) => {
        console.log("address",args.to.toString())


        tonConnectUI.sendTransaction({
          messages: [
            {
              // address: args.to.toString(),
              address: "0QATLTjTJn9QCgGpJAInEqbtrYqj6DllE7BxCappb4tK4PTr",
              amount: args.value.toString(),
              payload: body.toBoc().toString("base64"),
            },
          ],
          validUntil: Date.now() + 60 * 60 * 1000, // 5 minutes for user to approve
          // validUntil: Date.now() + 5 * 1000, // 5 minutes for user to approve
        }).then(() => {
          alert(`Transaction sent successfully`);
        });
      },
    },
    connected: !!wallet?.account.address,
    wallet: wallet?.account.address ?? null,
    network: wallet?.account.chain ?? null,
    // number: wallet?tonConnectUI.getBalance() ?? 0,
  };
}
