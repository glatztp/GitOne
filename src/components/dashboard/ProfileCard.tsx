import type { JSX } from "react";
import { MapPin } from "@phosphor-icons/react";
import type { GitHubUser } from "./types";
import { motion } from "framer-motion";

type Props = { user: GitHubUser | null; username: string };

export default function ProfileCard({ user, username }: Props): JSX.Element {
  return (
    <motion.div
      className="card w-full rounded-xl border p-6 text-center transition-shadow hover:shadow-lg"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <img
        className="mx-auto h-24 w-24 rounded-full"
        src={user?.avatar_url ?? "https://via.placeholder.com/96"}
      />
      <h2 className="mt-4 text-2xl font-bold text-color">
        {user?.name ?? username}
      </h2>
      <p className="text-primary">@{user?.login ?? username}</p>
      <p className="mt-2 text-sm text-color/70">
        {user ? (
          <>
            Perfil público do GitHub —{" "}
            <a
              className="text-primary underline"
              href={user.html_url}
              target="_blank"
              rel="noreferrer"
            >
              ver no GitHub
            </a>
          </>
        ) : (
          <>Busque um usuário para ver detalhes</>
        )}
      </p>

      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-color/70">
        <MapPin size={18} className="text-color/70" />
        <span>{user?.location ?? "—"}</span>
      </div>

      <div className="mt-4 flex justify-center gap-6">
        <div className="text-center">
          <p className="text-xl font-bold text-color">
            {user?.followers ?? "—"}
          </p>
          <p className="text-xs text-color/70">Seguidores</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-color">
            {user?.following ?? "—"}
          </p>
          <p className="text-xs text-color/70">Seguindo</p>
        </div>
      </div>
    </motion.div>
  );
}
