<div style="font-family: Arial, sans-serif; color: #333;">
    <h2>New Contact Message</h2>
    <p>You have received a new contact form submission.</p>
    <table cellpadding="8" cellspacing="0" border="0">
        <tr>
            <td><strong>Name:</strong></td>
            <td>{{ $name }}</td>
        </tr>
        <tr>
            <td><strong>Email:</strong></td>
            <td>{{ $email }}</td>
        </tr>
        <tr>
            <td><strong>Phone:</strong></td>
            <td>{{ $number }}</td>
        </tr>
        <tr>
            <td><strong>Message:</strong></td>
            <td>{{ $message }}</td>
        </tr>
    </table>
</div>
