import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GithubLogo,
  LinkSimple,
  ChartLineUp,
  Lightbulb,
} from "@phosphor-icons/react";
import Beams from "./Beams";
import ConnectModal from "./ui/ConnectModal";

export default function Home(): JSX.Element {
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "dark") document.documentElement.classList.add("dark");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // noop
    }
  }, []);

  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  function handleConfirm(name: string) {
    navigate(`/dashboard?user=${encodeURIComponent(name)}`);
    setShowModal(false);
  }

  return (
    <div className="relative w-full overflow-x-hidden bg-black home-force-white">
      <header className="absolute top-0 z-20 flex w-full items-center justify-between py-6 px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="GitOne Logo" className="h-24 w-24" />
        </div>
      </header>

      <main className="relative z-10">
        <div className="absolute inset-0 -z-10 overflow-hidden ">
          <Beams
            beamWidth={1.5}
            beamHeight={15}
            beamNumber={25}
            lightColor="#8f79db"
            speed={2}
            noiseIntensity={1}
            scale={0.2}
            rotation={30}
          />
        </div>

        <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden p-4">
          <div className="relative z-10 flex w-full max-w-7xl flex-col items-center text-center">
            <div className="flex flex-col items-center justify-center pt-10 pb-16 h-full">
              <motion.h2
                className="font-manifesto-title text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] leading-none tracking-tighter text-white uppercase mt-10"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: {} }}
              >
                <motion.span
                  className="block font-extrabold"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ delay: 0.08, duration: 0.5 }}
                >
                  GITHUB.
                </motion.span>
                <motion.span
                  className="block font-extrabold text-[#8f79db]"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ delay: 0.18, duration: 0.6 }}
                >
                  YOUR DATA.
                </motion.span>
                <motion.span
                  className="block font-extrabold"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ delay: 0.28, duration: 0.6 }}
                >
                  MASTERED.
                </motion.span>
              </motion.h2>

              <motion.p
                className="mt-8 mb-10 max-w-2xl text-xl font-manifesto-desc italic text-text-dark/90 md:text-2xl"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.45 }}
              >
                Unleash unprecedented insights and elevate your development
                journey.
              </motion.p>

              <div className="mt-4 flex flex-col items-center gap-4 w-full max-w-xs sm:max-w-none">
                <motion.button
                  onClick={() => setShowModal(true)}
                  className="flex h-14 w-full sm:w-[280px] items-center justify-center gap-2 rounded-full bg-primary px-6 text-lg font-bold text-background-dark shadow-lg shadow-primary/30 border"
                  aria-label="Connect with GitHub"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.35 }}
                  whileHover={{ scale: 1.04, translateY: -3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <GithubLogo
                    size={28}
                    weight="fill"
                    className="h-7 w-7"
                    aria-hidden
                  />
                  <span>Connect with GitHub</span>
                </motion.button>

                <ConnectModal
                  open={showModal}
                  onClose={() => setShowModal(false)}
                  onConfirm={handleConfirm}
                />
              </div>
            </div>
          </div>
        </section>

        <section
          id="explore"
          className="py-20 sm:py-32 px-4 bg-background-dark"
        >
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="font-manifesto-title text-5xl sm:text-6xl text-primary uppercase tracking-tight">
                Como Funciona
              </h2>
              <p className="mt-4 text-lg text-text-dark/70 max-w-2xl mx-auto">
                Transforme seus dados do GitHub em insights poderosos em apenas
                três passos simples.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
              <article className="flex flex-col items-center text-center p-8 border border-surface-dark rounded-xl bg-surface-dark/30">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/50 mb-6">
                  <LinkSimple
                    size={40}
                    weight="fill"
                    className="text-primary"
                    aria-hidden
                  />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  1. Conecte seu GitHub
                </h3>
                <p className="mt-2 text-text-dark/70">
                  Autentique sua conta do GitHub de forma segura para nos dar
                  acesso aos seus dados públicos.
                </p>
              </article>

              <article className="flex flex-col items-center text-center p-8 border border-primary/50 rounded-xl bg-surface-dark/50 shadow-lg shadow-primary/20 scale-105">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/50 mb-6">
                  <ChartLineUp
                    size={40}
                    weight="fill"
                    className="text-primary"
                    aria-hidden
                  />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  2. Visualize seus Dados
                </h3>
                <p className="mt-2 text-text-dark/70">
                  Nossa plataforma processa e organiza suas métricas em um
                  dashboard interativo e fácil de usar.
                </p>
              </article>

              <article className="flex flex-col items-center text-center p-8 border border-surface-dark rounded-xl bg-surface-dark/30">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/50 mb-6">
                  <Lightbulb
                    size={40}
                    weight="fill"
                    className="text-primary"
                    aria-hidden
                  />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  3. Obtenha Insights
                </h3>
                <p className="mt-2 text-text-dark/70">
                  Descubra tendências, identifique pontos fortes e tome decisões
                  baseadas em dados para crescer.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 sm:py-32 px-4 bg-background-dark/80 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="font-manifesto-title text-5xl sm:text-6xl text-white uppercase tracking-tight">
                O que dizem os <span className="text-primary">DEVS</span>
              </h2>
              <p className="mt-4 text-lg text-text-dark/70 max-w-2xl mx-auto">
                Desenvolvedores de todo o mundo estão usando GitOne para
                aprimorar suas carreiras.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
              <figure className="flex flex-col justify-between rounded-xl border border-surface-dark bg-surface-dark p-8">
                <blockquote className="text-lg italic text-text-dark/90">
                  "GitOne mudou a forma como eu vejo minha própria
                  produtividade. Os insights sobre repositórios e contribuições
                  são incrivelmente valiosos. Uma ferramenta indispensável!"
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-4">
                  <img
                    alt="Foto de Maria Silva"
                    className="h-14 w-14 rounded-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvMOSzBkJGU9ZJjl7BVDGt5ebILd5RQy7lhHYDTERSld_XXFKopOtn7HWEdFYdOT41wjEfxeO0M7QVFcSBqOSU7Fv4fkA3prhB6QFRTQkezy0wa80zq2g4p-3HIpHodasNaQMC_uOLwGesdsQa8EKus52MiKdhm6ughnHbgdUFIeDOJLWmT2-e_fBtE7RyZVktsOQFKh7LU8H5aqkA9YgQFgRg89aupmtj9IdAijjIAsFRV0apN78fYFW_BS4yHient5KDtnpkPjGL"
                  />
                  <div>
                    <p className="font-bold text-white">Maria Silva</p>
                    <p className="text-sm text-primary-light">
                      Desenvolvedora Frontend
                    </p>
                  </div>
                </figcaption>
              </figure>

              <figure className="flex flex-col justify-between rounded-xl border border-surface-dark bg-surface-dark p-8">
                <blockquote className="text-lg italic text-text-dark/90">
                  "Finalmente um dashboard que consolida tudo o que importa. A
                  interface é limpa, rápida e visualmente deslumbrante. Me ajuda
                  a me preparar para avaliações de desempenho."
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-4">
                  <img
                    alt="Foto de Carlos Oliveira"
                    className="h-14 w-14 rounded-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBrHVKBhcmBmSAhtFHWRgbr6xIp3AJV8Wc_u5T5gbJLhNDvzcN81Nxn1d7Uk9SAEkfRdYukPeT08mDDpi6_bs4wuk9IIJRQ3KPO-RClIrn4ZhyJ5CVbWYblr9yv_adQmTCv2favi53NLb3EEKn5c4f5k8Ob_YotCQ4-BAB1NBNR77mtrXEhs1JSFNzSR8nJweI6vNAFK1B37kiNXN0koPIavWCGisNninlhijd5xNBjwrz2Q9wdtdtanrh3oH10h2rCCv4cCrfYgWB"
                  />
                  <div>
                    <p className="font-bold text-white">Carlos Oliveira</p>
                    <p className="text-sm text-primary-light">
                      Engenheiro de Software
                    </p>
                  </div>
                </figcaption>
              </figure>

              <figure className="flex flex-col justify-between rounded-xl border border-surface-dark bg-surface-dark p-8">
                <blockquote className="text-lg italic text-text-dark/90">
                  "Como gerente de equipe, uso o GitOne para ter uma visão geral
                  do progresso do time. É poderoso, intuitivo e economiza um
                  tempo enorme."
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-4">
                  <img
                    alt="Foto de Ana Souza"
                    className="h-14 w-14 rounded-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxd4l_RUVDSePxMrvIt_rJFlBQ2A-QangB3_dXFTmOiuVJSbtgNvQGTmRM9x4jy6gK1G_XNfBq58FegzztD4ks4xoYKLmL5IxU6X1bXsGoGLI6tHcQhR7d4v2K_mLRzCoJt27ia9QTyIS_h2z5NMSJk1aB1vk_Jugt83tEcvFxpGD6rnPuT6LOsoPL8GT6oAsShsgE8BSNUxiX0hoJkkD2RZIsqzvufWNQ_y9cZdM6iG9CSnL3BoUcfkEkVK4ILe3ctIgR_oPaz9CK"
                  />
                  <div>
                    <p className="font-bold text-white">Ana Souza</p>
                    <p className="text-sm text-primary-light">Tech Lead</p>
                  </div>
                </figcaption>
              </figure>
            </div>

            <div className="mt-8 flex justify-center items-center gap-2">
              <button className="h-3 w-3 rounded-full bg-primary" aria-hidden />
              <button
                className="h-3 w-3 rounded-full bg-surface-dark hover:bg-primary/50 transition"
                aria-hidden
              />
              <button
                className="h-3 w-3 rounded-full bg-surface-dark hover:bg-primary/50 transition"
                aria-hidden
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
