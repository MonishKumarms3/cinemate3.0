/** @format */

function Footer() {
	return (
		<footer className='bg-gray-800 text-white py-4'>
			<div className='container mx-auto text-center'>
				<p>&copy; 2025 Cinemate. All rights reserved.</p>
			</div>
			<style jsx>
				{`
					footer {
						background-color: #2d3748;
						color: #fff;
						padding: 20px 0;
					}
					.container {
						max-width: 1200px;
						margin: 0 auto;
						text-align: center;
					}
					p {
						margin: 0;
						font-size: 14px;
					}
				`}
			</style>
		</footer>
	);
}

export default Footer;
