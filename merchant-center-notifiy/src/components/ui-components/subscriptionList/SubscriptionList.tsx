
const SubscriptionList = () => {


    
    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>Trigger Type</th>
                        <th>Email</th>
                        <th>Whatsapp</th>
                        <th>SMS</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th colSpan={4}>Orders</th>
                    </tr>
                    <tr>
                        <td>Order Confirmation</td>
                        <td>Yes</td>
                        <td>Yes</td>
                        <td>Yes</td></tr>
                </tbody>
            </table>
        </div>
    )
}

export default SubscriptionList