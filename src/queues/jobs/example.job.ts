import { sendGrid } from '../../utils/email.util'

const update = async (data: { email: string, name: string, url: string }): Promise<void> => {

    let emailData = {

        template: 'welcome',
        email: data.email,
        preheaderText: `update from Gamr`,
        emailTitle: 'Gamr Update',
        emailSalute: `Hello, ${data.name}`,
        bodyOne: `
        Your current engagement's talent match with Gamr has been updated. 
        Please use the button below to check the current update on the talent selection.`,
        buttonUrl: `${data.url}`,
        buttonText: 'View Update',
        fromName: process.env.FROM_NAME

    }

    await sendGrid(emailData);

}


export default { update }


