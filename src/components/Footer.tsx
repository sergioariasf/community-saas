import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="p-4 bg-gray-50 sm:p-6 dark:bg-slate-800">
      <div className="mx-auto md:container pt-16 md:pt-24">
        <div className="md:flex md:justify-between pb-16 md:pb-24">
          <div className="mb-6 md:mb-0">
            <a href="/" className="flex items-center">
              <Image
                src={'/logos/logo-fazil.svg'}
                className="mr-3 h-8"
                width={140}
                height={32}
                alt="Fazil Logo"
              />
              <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
                Fazil
              </span>
            </a>

            <p className="mt-4 mb-8 text-gray-600 dark:text-gray-400">
              Fazil - Gestión Documental<br />
              Las Rozas, Madrid
            </p>
          </div>
          <div className="flex justify-end">
            <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">
                Legal
              </h2>
              <ul className="text-gray-600 dark:text-gray-400">
                <li className="mb-4">
                  <a href="/privacy" className="hover:underline">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:underline">
                    Terms &amp; Conditions
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
            © 2024{' '}
            <a href="/" className="hover:underline">
              Fazil
            </a>
            . Todos los derechos reservados.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
